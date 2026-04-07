import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    setTimeout(() => {
      if (hash) {
        const element = document.getElementById(hash.replace('#', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }, 0);
  }, [pathname, hash, key]);

  return null;
}