import React from "react";
import { motion } from "framer-motion";
import UploadArea from "./components/UploadArea";
import CameraInput from "./components/CameraInput";

export default function App() {
  return (
    <motion.div
      className="app-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <h1 className="title">🎨 Cartoonify Your Image</h1>
      <UploadArea />
      <CameraInput />
    </motion.div>
  );
}
