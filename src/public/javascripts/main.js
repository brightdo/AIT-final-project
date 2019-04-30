const xml = new XMLHttpRequest();
const btn = document.getElementById('add book');
// document.body.appendChild(btn);
// btn.innerHTML = "add book";
// btn.id = "add book";

function addBookBtn(){
    const BtnArray = [];
    for( let i=0; i<document.getElementsByClassName('addBtn').length; i++){
        BtnArray.push(document.getElementsByClassName('addBtn')[i]);
    } 
    BtnArray.map((Btn) => {
        Btn.onclick = function(){
            xml.open("POST", "/add-book-to-list", true);
            xml.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'); 
            xml.send("book=" +Btn.id);
            alert("success adding book");
            xml.onreadystatechange = function() {
                if(xml.readyState === 4 && xml.status === 200) {
                    window.location.href = xml.responseText;
        }
    };
};
    });
    }

if( btn !== null){
btn.onclick = function(){
    document.getElementById('modal-book').setAttribute("style", "display:block");
    const addBook = document.getElementById('create-book');
    addBook.onclick = function(){
    xml.open("POST", "/add-book", true);
    xml.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'); 
    const title = document.getElementById('title').value;
    const edition = document.getElementById('edition').value;
    const author = document.getElementById('author').value;
    const isbn = document.getElementById('isbn').value;
    const myclass =document.getElementsByClassName('className')[0].id;
    if(title === ""){
        alert("please input a value for title");
    }
    else if(edition === ""){
        alert("please input a value for edition");
    }
    else if(author === ""){
        alert("please input a value for author");
    }
    else if(isbn === ""){
        alert("please input a value for isbn");
    }
    else{
    xml.send("title=" +title +"&edition="+ edition +"&author=" +author +"&isbn=" +isbn+ "&id=" + myclass);
    xml.onreadystatechange = function() {
        if(xml.readyState === 4 && xml.status === 200) {
            document.getElementById('modal-book').setAttribute("style", "display:none;");
            const newBook = document.createElement('li');
            newBook.innerHTML = title + " edition:" + edition + " author:" + author + " isbn:" + isbn;
            document.getElementById('textbooks-list').appendChild(newBook);
            window.location.href = "/classinfo/" + document.getElementsByClassName('className')[0].innerHTML.trim();

            addBookBtn();
    }
};
    }

    };
    const close = document.getElementById('cancel');
close.onclick = function(){
document.getElementById('modal-book').setAttribute("style", "display:none");
};
};
}

if(document.getElementById('update-professor') !== null){
document.getElementById('update-professor').onclick = function(){
    const input = document.getElementById('change-professor');
    input.setAttribute('style', "display:inline-block;");
    const submit = document.getElementById('submit-prof');
    submit.setAttribute('style', "display:inline-block;");
    document.getElementById('update-professor').setAttribute('style', "display:none;");
    submit.onclick = function(){
        xml.open("POST", "/update-professor", true);
        xml.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'); 
        xml.send("newProf=" + input.value + "&id=" + document.getElementsByClassName('className')[0].id + "&className=" + document.getElementsByClassName('className')[0].innerHTML);
        xml.onreadystatechange = function() {
            if(xml.readyState === 4 && xml.status === 200) {
                document.getElementById('professor').innerHTML = input.value;
                document.getElementById('update-professor').setAttribute('style', "display:inline-block;");
                submit.setAttribute('style', "display:none;");
                input.setAttribute('style', "display:none;");
        }
    };
    };
};
}
if(document.getElementById('remove-book') !== null){
document.getElementById('remove-book').onclick = function(){
    const input = document.getElementById('remove-input');
    input.setAttribute('style', "display:inline-block;");
    const submit = document.getElementById('remove-submit');
    submit.setAttribute('style', "display:inline-block;");
    submit.onclick = function(){
        if(input.value === "" || input.value === "isbn"){
            alert("please put an input for isbn");
        }
        else{
        xml.open("POST", "/remove-book", true);
        xml.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'); 
        xml.send("isbn=" + input.value + "&id=" + document.getElementsByClassName('className')[0].id);
        xml.onreadystatechange = function() {
            if(xml.readyState === 4 && xml.status === 200) {
                window.location.href = "/classinfo/" + document.getElementsByClassName('className')[0].innerHTML.trim();
        }
    };
}
    };

};
}
addBookBtn();

// document.getElementById("addToList").onclick = function(){
//     console.log("you pushed me");
// }
