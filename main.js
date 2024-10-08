import GridHover from "./hover.js";

const dialogue = document.querySelector(".input");
const inputs = document.querySelectorAll('input[type="radio"]');
const imageUpload = document.querySelector('input[type="file"]');
const startBtn = document.querySelector(".startExperience");
const resetBtn = document.querySelector(".resetExperience");
const imagePreview = document.querySelector(".imagePreview");

let selectedImage = null;
let experienceActive = false;
const experience = {
	active: false,
	object: null,
};

inputs.forEach((input) => {
	input.addEventListener("change", (e) => {
		selectedImage = e.target.value;
	});
});

imageUpload.addEventListener("change", (e) => {
	if (imagePreview.childNodes.length >= 1) {
		imagePreview.removeChild(imagePreview.childNodes[0]);
	}
	// Get file
	const file = e.target.files[0];
	const img = document.createElement("img");
	img.src = URL.createObjectURL(file);
	img.onload = () => {
		imagePreview.appendChild(img);
	};

	// Get image data url
	const reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload = () => {
		selectedImage = reader.result;
	};
});

startBtn.addEventListener("click", () => {
	if (!selectedImage) return;

	dialogue.style.display = "none";
	const canvas = document.querySelector(".webgl");
	experience.object = new GridHover({ dom: canvas }, selectedImage);
	experience.active = true;
	resetBtn.style.display = "block";
});

resetBtn.addEventListener("click", () => {
	location.reload();
});
