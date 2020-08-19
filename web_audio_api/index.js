navigator
    .mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then(stream => {
        console.log(stream)
    })
    .catch(err => {
        console.log(err)
    })