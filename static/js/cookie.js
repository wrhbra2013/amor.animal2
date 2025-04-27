// window.onload = 

// {
//     window.document.addEventListener("DOMContentLoaded", function() {
//     // Check if the user has already accepted cookies
    function cookies() {
    if (localStorage.getItem("cookiesAccepted")) {
        // User has accepted cookies, do nothing
    } else {
        // User has not accepted cookies, show the banner
        const banner = document.createElement("div");
        banner.id = "cookie-banner";
        banner.style.position = "fixed";
        banner.style.bottom = "0";
        banner.style.width = "100%";
        banner.style.backgroundColor = "#333";
        banner.style.color = "#fff";
        banner.style.padding = "10px";
        banner.style.textAlign = "center";
        banner.style.zIndex = "1000";

        banner.innerHTML = `
            <p style="margin: 0; display: inline;">  Nós usamos cookies para melhorar sua experiência de navegação. Ao usar o site você estara concordando com nossos termos. <a href="/privacy-policy" style="color: #4CAF50; text-decoration: underline;">privacy policy</a>.</p>
            <button id="accept-cookies" style="margin-left: 10px; padding: 5px 10px; background-color: #4CAF50; color: #fff; border: none; cursor: pointer;">Accept</button>
        `;

        document.body.appendChild(banner);

        document.getElementById("accept-cookies").addEventListener("click", () => {
            localStorage.setItem("cookiesAccepted", "true");
            document.body.removeChild(banner);
        });
    }
};

cookies()