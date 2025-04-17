async function sendMessageWithWhatsAppAPI(phoneNumber, message) {
    const url = 'https://graph.facebook.com/v16.0/YOUR_PHONE_NUMBER_ID/messages';
    const accessToken = 'YOUR_ACCESS_TOKEN';

    const payload = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: { body: message }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Message sent successfully:', data);
    } catch (error) {
        console.error('Failed to send message:', error);
    }
}

// Example usage:
// Replace 'PHONE_NUMBER' with the recipient's phone number in international format without '+' or '00'.
sendMessageWithWhatsAppAPI('+5514981305888', 'Hello, this is a test message!');