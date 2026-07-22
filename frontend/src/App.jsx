import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExcelWorkflow from "./components/ExcelWorkflow";
import CONSOLE_SCRIPT from "./consoleScript";

function App() {
  const [comments, setComments] = useState([]);
  const [fileName, setFileName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(CONSOLE_SCRIPT);
      toast.success("คัดลอกสคริปต์แล้ว");
    } catch (err) {
      toast.error("คัดลอกไม่สำเร็จ");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        throw new Error("Invalid format");
      }
      setComments(parsed);
      setFileName(file.name);
      toast.success("อ่านไฟล์สำเร็จ");
    } catch (err) {
      toast.error("ไฟล์ไม่ถูกต้อง (ต้องเป็น comments.json ที่ได้จากสคริปต์)");
      setComments([]);
      setFileName("");
    }
  };

  const handleGenerateExcel = async () => {
    if (comments.length === 0) {
      toast.error("ยังไม่มีคอมเมนต์");
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/generate-excel",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comments }),
        }
      );

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "comments.xlsx";
      a.click();
      URL.revokeObjectURL(url);

      toast.success("สร้างไฟล์ Excel สำเร็จ");
    } catch (error) {
      console.error("Error generating excel:", error);
      toast.error("สร้างไฟล์ไม่สำเร็จ");
    }
    setIsGenerating(false);
  };

  const handleReset = () => {
    setComments([]);
    setFileName("");
  };

  return (
    <>
      <ToastContainer />
      <div className="w-full h-screen flex flex-col justify-center items-center">
        <div className="container">
          <ExcelWorkflow
            comments={comments}
            fileName={fileName}
            isGenerating={isGenerating}
            handleCopyScript={handleCopyScript}
            handleFileChange={handleFileChange}
            handleGenerateExcel={handleGenerateExcel}
            handleReset={handleReset}
          />
        </div>
      </div>
    </>
  );
}

export default App;
