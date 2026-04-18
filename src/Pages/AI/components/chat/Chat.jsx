import "./Chat.css";
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "../../../../api/axiosInstance";

function Chat() {
  const { fileId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fileFromState = location.state?.file;
  
  const [mode, setMode] = useState("ask");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [fullResponse, setFullResponse] = useState(null);

  // التحقق من وجود الملف في الـ state
  useEffect(() => {
    if (!fileFromState) {
      console.warn("⚠️ No file in state, redirecting to /ai");
      navigate("/ai", { replace: true });
      return;
    }
    
    // التحقق من تطابق الـ IDs
    if (parseInt(fileId) !== fileFromState.id && fileFromState.id) {
      console.warn("⚠️ File ID mismatch:", { 
        urlFileId: fileId, 
        stateFileId: fileFromState.id,
        fileName: fileFromState.title 
      });
      setError(t("aiChat.fileIdMismatch") || "⚠️ يوجد تعارض في معرف الملف");
    } else {
      setError("");
    }
    
    setFileName(fileFromState.title);
    console.log("✅ Chat initialized with file:", {
      id: fileFromState.id,
      title: fileFromState.title,
      type: fileFromState.fileType,
      filePath: fileFromState.filePath,
      description: fileFromState.description
    });
  }, [fileFromState, fileId, navigate, t]);

  const handleAsk = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    setAnswer("");
    setError("");
    setFullResponse(null);
    
    const requestData = {
      fileId: parseInt(fileId),
      question: question.trim(),
    };
    
    console.log("📤 Sending request to AI:", {
      url: "/Api/EduFile/Ask",
      fileId: requestData.fileId,
      question: requestData.question,
      fileName: fileName
    });
    
    try {
      const response = await axios.post("/Api/EduFile/Ask", requestData);
      
      // تسجيل الرد الكامل
      console.log("📥 FULL RESPONSE from server:", JSON.stringify(response.data, null, 2));
      setFullResponse(response.data);
      
      console.log("📊 Response details:", {
        status: response.status,
        succeeded: response.data?.succeeded,
        hasData: !!response.data?.data,
        dataLength: response.data?.data?.length || 0,
        dataPreview: response.data?.data?.substring(0, 100) || "(empty)",
        fullData: response.data?.data
      });
      
      if (response.data?.succeeded) {
        const aiAnswer = response.data.data;
        
        // عرض الإجابة كما هي بدون تعديل
        setAnswer(aiAnswer || "(الرد فارغ)");
        
        // إذا كان الرد قصير جداً، اعرض تحذير
        if (aiAnswer && aiAnswer.length < 50) {
          console.warn("⚠️ Response is very short:", aiAnswer);
        }
      } else {
        const errorMsg = response.data?.message || t("aiChat.errorOccurred");
        setAnswer(`❌ ${errorMsg}`);
        console.error("❌ API returned error:", errorMsg);
      }
    } catch (error) {
      console.error("❌ Network/Server Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = t("aiChat.errorOccurred");
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "⚠️ انتهت مهلة الاتصال، حاول مرة أخرى";
      } else if (error.message === "Network Error") {
        errorMessage = "⚠️ خطأ في الشبكة، تأكد من اتصالك بالإنترنت";
      }
      
      setAnswer(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSummary = async () => {
    setLoading(true);
    setAnswer("");
    setError("");
    setFullResponse(null);
    
    console.log("📤 Requesting summary for file ID:", fileId);
    
    try {
     const response = await axios.get(`/Api/EduFile/GetSummary/${parseInt(fileId)}`);
      
      console.log("📥 FULL SUMMARY RESPONSE:", JSON.stringify(response.data, null, 2));
      
      if (response.data?.succeeded) {
        setAnswer(response.data.data || "(لا يوجد ملخص)");
      } else {
        setAnswer(response.data?.message || t("aiChat.summaryError"));
      }
    } catch (error) {
      console.error("❌ Summary error:", error);
      setAnswer(t("aiChat.summaryError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!question.trim() && mode === "ask") {
      setError("⚠️ الرجاء إدخال سؤال");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    if (mode === "ask") {
      handleAsk();
    } else {
      handleSummary();
    }
  };

  return (
    <div className="ai-chat">
      <div className="chat-header">
        <h2>📄 {fileName}</h2>
        <p>{t("aiChat.headerSubtitle")}</p>
        {error && <div className="error-message" style={{color: "orange", fontSize: "12px", marginTop: "5px"}}>{error}</div>}
      </div>

      <div className="mode-tabs">
        <button
          className={`mode-tab ${mode === "ask" ? "active" : ""}`}
          onClick={() => {
            setMode("ask");
            setAnswer("");
            setQuestion("");
            setError("");
            setFullResponse(null);
          }}
        >
          💬 {t("aiChat.ask")}
          <span>{t("aiChat.askSubtitle")}</span>
        </button>
        <button
          className={`mode-tab ${mode === "summary" ? "active" : ""}`}
          onClick={() => {
            setMode("summary");
            setAnswer("");
            setQuestion("");
            setError("");
            setFullResponse(null);
          }}
        >
          📝 {t("aiChat.summary")}
          <span>{t("aiChat.summarySubtitle")}</span>
        </button>
      </div>

      {mode === "ask" && (
        <div className="chat-input-area">
          <textarea
            className="chat-textarea"
            placeholder={t("aiChat.questionPlaceholder")}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            className="send-button"
            onClick={handleSend}
            disabled={loading || !question.trim()}
          >
            {loading ? t("aiChat.processing") : t("aiChat.send")}
          </button>
        </div>
      )}

      {mode === "summary" && (
        <div className="summary-area">
          <button
            className="generate-summary-btn"
            onClick={handleSummary}
            disabled={loading}
          >
            {loading ? t("aiChat.summarizing") : t("aiChat.generateSummary")}
          </button>
        </div>
      )}

      {answer && (
        <div className="answer-container">
          <div className="answer-header">
            <span>{mode === "ask" ? t("aiChat.answer") : t("aiChat.summaryLabel")}</span>
            <button 
              onClick={() => console.log("Current answer:", answer)}
              style={{marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: "16px"}}
              title="نسخ إلى console"
            >
              📋
            </button>
          </div>
          <div className="answer-content">
            <pre style={{whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0, lineHeight: "1.5"}}>
              {answer}
            </pre>
          </div>
        </div>
      )}

      {/* عرض الرد الخام من السيرفر للمطور */}
      {fullResponse && (
        <div style={{marginTop: "20px", padding: "10px", background: "#f0f0f0", borderRadius: "8px", fontSize: "12px", direction: "ltr", textAlign: "left"}}>
          <details>
            <summary style={{cursor: "pointer", fontWeight: "bold"}}>🔧 الرد الخام من السيرفر (للتصحيح)</summary>
            <pre style={{overflowX: "auto", fontSize: "11px"}}>
              {JSON.stringify(fullResponse, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {!answer && mode === "ask" && !question && (
        <div className="welcome-message">
          <p>{t("aiChat.welcomeTitle")}</p>
          <ul>
            <li>{t("aiChat.welcomeItems.concepts")}</li>
            <li>{t("aiChat.welcomeItems.differences")}</li>
            <li>{t("aiChat.welcomeItems.explain")}</li>
            <li>{t("aiChat.welcomeItems.examples")}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Chat;