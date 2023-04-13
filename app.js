console.log('fetching....')

fetch(`http://localhost:3040/api/family`)
        .then(response => response.json())
        .then(data => {
            console.log(data[0].name)
        })