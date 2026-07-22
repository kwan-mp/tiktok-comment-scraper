import React from "react";

const ExcelWorkflow = ({
  comments,
  fileName,
  isGenerating,
  handleCopyScript,
  handleFileChange,
  handleGenerateExcel,
  handleReset,
}) => {
  return (
    <div className="container p-5 shadow-xl rounded-lg">
      <h1 className="text-4xl font-bold text-center my-5 text-blue-500">
        TikTok comments to Excel
      </h1>

      <div className="mb-6 border rounded-lg p-4">
        <div className="font-bold text-lg mb-2">ขั้นตอนที่ 1: ดึงคอมเมนต์จากวิดีโอ</div>
        <ol className="list-decimal list-inside text-sm mb-3 space-y-1">
          <li>เปิดวิดีโอ TikTok ในเบราว์เซอร์ปกติ (ยังไม่ต้องเปิดคอมเมนต์)</li>
          <li>กด F12 → แท็บ Console</li>
          <li>กดปุ่ม "คัดลอกสคริปต์" ด้านล่าง แล้ววางในหน้า Console กด Enter</li>
          <li>ตอนนี้ค่อยกดเปิดคอมเมนต์ในหน้าเว็บ แล้วเลื่อนดูจนครบ</li>
          <li>พิมพ์ <code>saveComments()</code> ใน Console แล้ว Enter — จะได้ไฟล์ comments.json</li>
        </ol>
        <button
          className="bg-blue-500 text-white font-bold rounded-lg px-4 py-2 hover:bg-blue-600"
          onClick={handleCopyScript}
        >
          คัดลอกสคริปต์
        </button>
      </div>

      <div className="mb-6 border rounded-lg p-4">
        <div className="font-bold text-lg mb-2">ขั้นตอนที่ 2: อัปโหลด comments.json</div>
        <input
          type="file"
          accept="application/json"
          onChange={handleFileChange}
          className="text-sm"
        />
        {fileName && (
          <div className="text-sm text-gray-500 mt-2">
            เลือกไฟล์แล้ว: {fileName} ({comments.length} คอมเมนต์)
          </div>
        )}
      </div>

      <div className="border rounded-lg p-4 flex justify-between items-center">
        <div className="font-bold text-lg">ขั้นตอนที่ 3: สร้างไฟล์ Excel</div>
        <div>
          <button
            className="bg-green-500 text-white font-bold rounded-lg px-4 py-2 mr-2 hover:bg-green-600 disabled:bg-green-300"
            disabled={comments.length === 0 || isGenerating}
            onClick={handleGenerateExcel}
          >
            {isGenerating ? "กำลังสร้าง..." : "Generate Excel"}
          </button>
          <button
            className="bg-gray-400 text-white hover:bg-gray-500 rounded-lg px-4 py-2 font-bold"
            onClick={handleReset}
          >
            reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelWorkflow;
