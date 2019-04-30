const xml = new XMLHttpRequest();
const btn = document.getElementById('remove-book-list');

btn.onclick = function(){
    const input = document.getElementById('remove-textbook-select');
        xml.open("POST", "/remove-book-list", true);
        xml.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'); 
        xml.send("isbn=" + input.value);
        xml.onreadystatechange = function() {
            if(xml.readyState === 4 && xml.status === 200) {
                window.location.href = "/list";
        }
    };
    window.location.href = "/list";
    };
