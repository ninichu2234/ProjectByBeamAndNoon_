async function promptGemini() {
    const API_KEY = 'AIzaSyBKc_6DmN-5YZWtnKqRzjGCdqb7txWsv3I'
    const MODEL_NAME = 'gemini-2.5-pro';
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/'+ MODEL_NAME+':generateContent?key=' + API_KEY;
   // var myOwnContent = " We open between 8am - 6pm during weekday. "  +
                       //" During weekend, we open 10am - 9am."
    //var promptText = "Use the following information:" +myOwnContent+ ".";
    //promptText += document.getElementById('question').value;
    var fileFromHTML = document.getElementById('fileInput');
    var file = fileFromHTML.files[0];
    var fileData = await readTextFile(file);

    var myOwnContent = " We open between 8am - 6pm during weekday. "  +
                       " During weekend, we open 10am - 9am."
    var promptText = "Use the following information:" +myOwnContent+ ".";
    promptText += "Also use this information: "+ fileData;
    promptText += "Answer the following phase:" //ทำให้ text มันต่อกัน
    promptText += document.getElementById('question').value;

    var requestBody = {
        contents : [{
            parts: [{ text: promptText}]
        }]
    };
    try {
        var response = await fetch(API_URL, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(requestBody)
        });
        if( !response.ok){
            let errorDetail = 'HTTP error! status ${response.status}';
            throw new console.error(errorDetail);
        }
        var data = await response.json();
        var responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText){
            document.getElementById('answer').innerHTML = responseText;
        }
    } catch (error) {
        console.log('Error calling Gemini API:', error);
    }
}

function readTextFile(filename) {
    return new Promise ( (resolve, reject) => {
       var reader = new FileReader();
       reader.onload = () => resolve(reader.result);
       reader.onerror = () => reject;
       reader.readAsText(filename);
    })
    
}