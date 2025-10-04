import streamlit as st
from PIL import Image

st.set_page_config(page_title="Cartoonify Your Image", page_icon="🎨", layout="centered")

st.title("Cartoonify Your Image")

uploaded_file = st.file_uploader("Upload an image", type=["jpg", "jpeg", "png"])

if uploaded_file:
    image = Image.open(uploaded_file)
    st.image(image, caption="Uploaded Image", use_column_width=True)
    st.success("Image uploaded successfully! (Cartoonify logic to be added here)")

if st.button("Use Camera"):
    st.info("Camera integration is not yet implemented in this Streamlit demo.")
