// // Function to disable all HTML elements on the page
// const disableAllElements = () => {
//   // Get all elements in the document
//   const allElements = document.querySelectorAll("*");

//   allElements.forEach((element) => {
//     // Check if the element supports the 'disabled' attribute
//     if (typeof element.disabled !== "undefined") {
//       element.disabled = true; // Disable the element
//     } else {
//       // For elements that don't support 'disabled', prevent interaction
//       element.style.pointerEvents = "none";
//       element.style.opacity = "0.5"; // Optional: visually indicate disabled state
//     }
//   });
// };

// // Disable elements immediately
// disableAllElements();

// // Observe dynamically added elements and disable them
// const observer = new MutationObserver(() => {
//   disableAllElements();
// });

// // Start observing the document for added/removed nodes
// if (document.body) {
//   observer.observe(document.body, {
//     childList: true,
//     subtree: true,
//   });
// } else {
//   document.addEventListener("DOMContentLoaded", () => {
//     observer.observe(document.body, {
//       childList: true,
//       subtree: true,
//     });
//   });
// };