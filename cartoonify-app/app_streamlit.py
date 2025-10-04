import streamlit as st
from PIL import Image

st.set_page_config(page_title="Cartoonify Your Image", page_icon="🎨", layout="centered")

# --- Load external CSS (styles.css) ---
def local_css(file_name):
    with open(file_name) as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

# Call this if you have styles.css in the same folder
local_css("styles.css")

# --- App Layout (HTML + Streamlit combined) ---
st.markdown("""
<div class="app-container">
  <h1 class="title">🎨 Cartoonify Your Image</h1>

  <div class="upload-card">
    <h2>Upload an Image</h2>
</div>
""", unsafe_allow_html=True)

# Streamlit’s uploader (keeps functionality, styled via CSS)
uploaded_file = st.file_uploader("", type=["jpg", "jpeg", "png"])

if uploaded_file:
    image = Image.open(uploaded_file)
    st.image(image, caption="Uploaded Image", use_column_width=True, output_format="PNG")
    st.markdown("<p style='color:#10b981;'>✅ Image uploaded successfully!</p>", unsafe_allow_html=True)

st.markdown("""
  <div class="camera-card">
    <h2>Use Camera</h2>
</div>
""", unsafe_allow_html=True)

if st.button("📸 Open Camera"):
    st.info("Camera integration is not yet implemented in this Streamlit demo.")
