import streamlit as st
from PIL import Image
import os

st.set_page_config(page_title="Cartoonify Your Image", page_icon="🎨", layout="centered")

# Safer CSS loader
def local_css(file_name):
    css_path = os.path.join(os.path.dirname(__file__), file_name)
    if os.path.exists(css_path):
        with open(css_path) as f:
            st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)
    else:
        st.error(f"❌ Could not find {css_path}")

# load styles.css from the same folder as this .py file
local_css("styles.css")

# --- App Layout ---
st.markdown("<div class='app-container'><h1 class='title'>🎨 Cartoonify Your Image</h1></div>", unsafe_allow_html=True)

uploaded_file = st.file_uploader("Upload an image", type=["jpg", "jpeg", "png"])

if uploaded_file:
    image = Image.open(uploaded_file)
    st.image(image, caption="Uploaded Image", use_column_width=True, output_format="PNG")
    st.success("✅ Image uploaded successfully!")

if st.button("📸 Open Camera"):
    st.info("Camera integration is not yet implemented in this Streamlit demo.")
