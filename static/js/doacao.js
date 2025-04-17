// This function is called when the user selects an option from the dropdown menu   
function handleOptionChange(selectElement) {
  const selectedValue = selectElement.value;
 
   const pixInfo = document.getElementById('pix-info');
   const volunteerInfo = document.getElementById('volunteer-info');
   const foodDonationInfo = document.getElementById('food-donation-info');

   if (pixInfo && volunteerInfo && foodDonationInfo) {
     if (selectedValue === "1") {
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
       pixInfo.style.display = "none";
       volunteerInfo.style.display = "none";
       foodDonationInfo.style.display = "none";
     }
   } else {
     if (!pixInfo) console.error("Element with ID 'pix-info' not found.");
     if (!volunteerInfo) console.error("Element with ID 'volunteer-info' not found.");
     if (!foodDonationInfo) console.error("Element with ID 'food-donation-info' not found.");
   }

}
