import React, { useState } from "react";

export default function UploadArea() {
  const [image, setImage] = useState(null);

  const handleUpload = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]));
  };

  return (
    <div className="upload-card">
      <input type="file" accept="image/*" onChange={handleUpload} />
      {image && <img src={image} alt="Uploaded" className="preview" />}
    </div>
  );
}
