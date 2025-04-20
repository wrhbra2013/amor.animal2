// This function is called when the user selects an option from the dropdown menu   
document.addEventListener('DOMContentLoaded', () => {
  const pixInfo = document.getElementById('pix-info');
  const volunteerInfo = document.getElementById('volunteer-info');
  const foodDonationInfo = document.getElementById('food-donation-info');

  if (pixInfo) pixInfo.style.display = "none";
  if (volunteerInfo) volunteerInfo.style.display = "none";
  if (foodDonationInfo) foodDonationInfo.style.display = "none";
});

function handleOptionChange(selectElement) {
    // Ensure the first option is not displayed
    const selectedValue = selectElement.options[selectElement.selectedIndex].value;
  
 
   const pixInfo = document.getElementById('pix-info');
   const volunteerInfo = document.getElementById('volunteer-info');
   const foodDonationInfo = document.getElementById('food-donation-info');
  
   if (pixInfo && volunteerInfo && foodDonationInfo) {
     // Hide all sections if no valid option is selected
     if (selectedValue === "0") {
       pixInfo.style.display = "none";
       volunteerInfo.style.display = "none";
       foodDonationInfo.style.display = "none";
       
     } else  if (selectedValue === "1") {
       pixInfo.style.display = "block";
       volunteerInfo.style.display = "none";
       foodDonationInfo.style.display = "none";
     } else if (selectedValue === "2") {
       pixInfo.style.display = "none";
       volunteerInfo.style.display = "block";
       foodDonationInfo.style.display = "none";
     } else if (selectedValue === "3") {
       pixInfo.style.display = "none";
       volunteerInfo.style.display = "none";
       foodDonationInfo.style.display = "block";
     } else {
       console.log("Invalid selection");
     }
     
   }
    // Hide all 
    // sections if no valid option is selected
    if (selectedValue === "") {
      pixInfo.style.display = "none";
      volunteerInfo.style.display = "none";
      foodDonationInfo.style.display = "none";
    }     

}
