const unapprovedFlagsList = document.getElementById("unapproved-flags");

fetch(`${location.origin}/get-flags?approved=0`)
.then(res=>res.status==200 && res.json())
.then(data=>data.flags.map(flag=>{
    const unapprovedFlagListItem = document.createElement('li');
    const unapprovedFlagImage = document.createElement("img");
    const unapprovedFlagApproveButton = document.createElement("button");
    unapprovedFlagApproveButton.textContent = "Approve";
    unapprovedFlagApproveButton.addEventListener("click", event=>{
    fetch(`${location.origin}/set-flags`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({approved:true,flags:[flag['_id']]})
        }).then(unapprovedFlagListItem.remove());
    })
    unapprovedFlagApproveButton.value = flag['_id'];
    unapprovedFlagApproveButton.classList.add("text-button");
    unapprovedFlagImage.src = flag['png'];
    unapprovedFlagListItem.appendChild(unapprovedFlagImage);
    unapprovedFlagListItem.appendChild(unapprovedFlagApproveButton);
    unapprovedFlagsList.appendChild(unapprovedFlagListItem);
}));