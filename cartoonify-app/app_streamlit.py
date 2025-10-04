import streamlit as st
from PIL import Image
import os

st.set_page_config(page_title="Cartoonify Your Image", page_icon="🎨", layout="centered")

# Load CSS
def local_css(file_name):
    css_path = os.path.join(os.path.dirname(__file__), file_name)
    with open(css_path) as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

local_css("styles.css")

# --- App Layout ---
st.markdown("<div class='app-container'>", unsafe_allow_html=True)
st.markdown("<h1 class='title'>🎨 Cartoonify Your Image</h1>", unsafe_allow_html=True)

# Upload Card with uploader INSIDE
with st.container():
    st.markdown("<div class='upload-card'><h2>Upload an Image</h2>", unsafe_allow_html=True)
    uploaded_file = st.file_uploader("", type=["jpg", "jpeg", "png"], label_visibility="collapsed")
    st.markdown("</div>", unsafe_allow_html=True)

if uploaded_file:
    image = Image.open(uploaded_file)
    st.image(image, caption="Uploaded Image", use_column_width=True, output_format="PNG")
    st.success("✅ Image uploaded successfully!")

# Camera Card with button INSIDE
with st.container():
    st.markdown("<div class='camera-card'><h2>Use Camera</h2>", unsafe_allow_html=True)
    if st.button("📸 Open Camera"):
        st.info("Camera integration is not yet implemented in this demo.")
    st.markdown("</div>", unsafe_allow_html=True)

st.markdown("</div>", unsafe_allow_html=True)
