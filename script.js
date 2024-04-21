const friendList = document.querySelector("#friendList")
const connectionList = document.querySelector("#connectionList")
const addFriendInput = document.querySelector("#addFriendInput")
const vertex1Input = document.querySelector("#vertex1Input")
const vertex2Input = document.querySelector("#vertex2Input")
const edgeWeight = document.querySelector("#edgeWeight")

//For the stat descriptions
const totalFriendshipsLabel = document.querySelector('#totalFriendshipsLabel')
const mostPopularLabel = document.querySelector('#mostPopularLabel')
const isolatedVLabel = document.querySelector('#isolatedIndividualsLabel')
const averageFriendshipLabel = document.querySelector('#averageFriendshipLabel')


let vertices = [];
let edges = [];
let degrees = [];
let maxDegree = 0;
let maxIndex = 0;
let isolatedVs = [];

var cy = cytoscape({

    container: document.getElementById('cy'), // container to render in
  
    /*elements: [ // list of graph elements to start with
      { // node a
        data: { id: 'a' }
      },
      { // node b
        data: { id: 'b' }
      },
      { // edge ab
        data: { id: 'ab', source: 'a', target: 'b' }
      }
    ],*/
  
    style: [ // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          'background-color': '#666',
          'label': 'data(id)'
        }
      },
  
      {
        selector: 'edge',
        style: {
          'width': 3,
          'line-color': '#ccc',
          'curve-style': 'bezier',
          'label': 'data(weight)'
        }
      }
    ],
  
    layout: {
      name: 'grid',
      rows: 1
    }
  
});

function Edge(startVertex, endVertex, weight) {
    this.startVertex = startVertex;
    this.endVertex = endVertex;
    this.weight = weight;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}


function updateLists() 
{
    friendList.innerHTML = "";
    connectionList.innerHTML = "";
    vertex1Input.innerHTML = ""
    vertex2Input.innerHTML = ""


    //Updating the friends list and the vertex selectors to contain all current vertices
    for (let i = 0; i < vertices.length; i++) {

        let item = document.createElement('li');
        item.appendChild(document.createTextNode(vertices[i]));
        item.id = vertices[i];
        let deleteButton = document.createElement("button");

        //Add a button to call the function to delete the vertex within the graph and the array, and visually self-destruct this item.
        deleteButton.addEventListener("click", function() {
          removeFriend(item.id)
          item.remove()
        })

        deleteButton.innerHTML = "Delete"
        item.appendChild(deleteButton)
        
        friendList.appendChild(item);

        //Adds every friend vertex as a possible selection in the options for vertex1 and vertex2 for creating a connection.
        let friend = document.createElement('option');
        friend.appendChild(document.createTextNode(vertices[i]));
        friend.value = vertices[i]
        vertex1Input.appendChild(friend);

        let friend2 = document.createElement('option');
        friend2.appendChild(document.createTextNode(vertices[i]));
        friend2.value = vertices[i]
        vertex2Input.appendChild(friend2);
    }

    //Updating the connections list to contain all current Edges
    for (let i = 0; i < edges.length; i++) {
        let item = document.createElement('li');
        item.appendChild(document.createTextNode(edges[i].startVertex + " --( " + edges[i].weight + " )-> " + edges[i].endVertex));

        //Format for edge ID's: 'startVertex--endVertex'
        item.id = edges[i].startVertex + "--" + edges[i].endVertex
        let deleteButton = document.createElement("button");

        //Add a button to call the function to delete the edge within the graph and the array, and visually self-destruct this item.
        deleteButton.addEventListener("click", function() {
          removeConnection(edges[i].startVertex, edges[i].endVertex, edges[i].weight)
          item.remove()
        })

        deleteButton.innerHTML = "Delete"
        item.appendChild(deleteButton)

        connectionList.appendChild(item);
    }

    //Update the descriptions down at the bottom, which the assignment really requires

    //Set the label of total number of friendships to the total number of edges, cy.edges().length
    totalFriendshipsLabel.innerHTML = "Total Number of Friendships: " + cy.edges().length

    //Create an array of every node and their degrees
    //NOTE! To select a specific node, matched by their id, do cy.$id(vertices[i]). To get a certain node's degree, do cy.$id(vertices[i]).degree(false). True or false dictates if you should count edges that go back to the same node.

    console.log("Creating the degrees vertices!")
    degrees = [];
    for (const vertex of vertices)
    {
      degrees.push([cy.$id(vertex).id(), cy.$id(vertex).degree()])
    }

    console.log("Degrees: " + degrees)

    //Using that array, find the node with the highest degree

    for(let i = 0; i < degrees.length; i++) {
      if(degrees[i][1] > maxDegree) {
        console.log(degrees[i][0] + " has a greater degree of " + degrees[i][1] + " than the current max degree, " + maxDegree + "!")
        maxIndex = i;
        maxDegree = degrees[i][1]
      }
    }

    if (degrees.length == 0) {
      console.log("There's nothing in the degrees array.")

      mostPopularLabel.innerHTML = "Most Popular Person: "
      isolatedVLabel.innerHTML = "Isolated Individuals: None!"
      averageFriendshipLabel.innerHTML = "Average Friendship Strength: "


      return
    }

    console.log("Setting the most popular person!")
    mostPopularLabel.innerHTML = "Most Popular Person: " + degrees[maxIndex][0]

    
    //ALSO using that array, find the node with no degree, if it exists
    isolatedVLabel.innerHTML = "";
    isolatedVs = [];

    for(let i = 0; i < degrees.length; i++) {
      if(degrees[i][1] == 0) {
        isolatedVs.push(degrees[i][0])
      }
    }

    if (isolatedVs == null) {

      isolatedVLabel.innerHTML = "Isolated Individuals: None!"

    } else if (isolatedVs.length > 1) {

      isolatedVLabel.innerHTML = "Isolated Individuals: "

      for (let i = 0; i < isolatedVs.length - 1; i++) {
        isolatedVLabel.innerHTML = isolatedVLabel.innerHTML + isolatedVs[i] + ", "
      }

      isolatedVLabel.innerHTML = isolatedVLabel.innerHTML + isolatedVs[isolatedVs.length - 1] + "!"

    } else if (isolatedVs.length == 1) {

      isolatedVLabel.innerHTML = "Isolated Individuals: " + isolatedVs;

    } else {

      isolatedVLabel.innerHTML = "Isolated Individuals: None!"

    }
    
    //ALSO ALSO using that array, find the average edge weight
    let totalEdgeWeight = 0

    for (let i = 0; i < edges.length; i++)
    {
      console.log("This edge " + edges[i].startVertex + "'s weight is " + edges[i].weight)
      console.log(typeof(totalEdgeWeight))
      console.log(typeof(edges[i].weight))

      totalEdgeWeight += Number(edges[i].weight)
    }

    console.log("Setting the average friendship!")
    averageFriendshipLabel.innerHTML = "Average Friendship Strength: " + (totalEdgeWeight / edges.length);
}

updateLists();

function addFriend() {
  if (!vertices.includes(addFriendInput.value))
  {
    vertices.push(addFriendInput.value)

    cy.add({
        group: 'nodes',
        data: { 
            id: addFriendInput.value,
        },
        position: { x: getRandomInt(300), y: getRandomInt(400) }
    })

    console.log(vertices);
    addFriendInput.value = "";
    updateLists();
  }
}

//Remove this friend from the vertices array, and from the graph. 
function removeFriend(friendName)
{
  //Deletes them from the vertices array
  console.log("Removing " + friendName + "from the original vertices array.")
  vertices.splice(vertices.indexOf(friendName), 1)
  console.log(vertices)

  //Delete them visually from the graph.
  cy.remove(cy.$('#' + friendName))

  //We also need to delete every Edge that contains this vertice within our edges array.

  for (const edge of edges)
  {
    if (edge.startVertex == friendName || edge.endVertex == friendName)
    {
      edges.splice(edges.indexOf(edge), 1)
    }
  }

  updateLists();

}

function addConnection() {
  try {
    if (edgeWeight.value == "")
    {
      edgeWeight.value = 0;
    }
    edges.push(new Edge(vertex1Input.value, vertex2Input.value, edgeWeight.value))
    console.log(edges)

    cy.add({
        group: 'edges',
        data: {
            id: vertex1Input.value + "--" + vertex2Input.value,
            source: vertex1Input.value,
            target: vertex2Input.value,
            weight: edgeWeight.value
        }
    })

    vertex1Input.value = "";
    vertex2Input.value = "";
    edgeWeight.value = "";

    updateLists();
  } catch (error) {
    console.log("You probably just tried to add an edge that already exists. Don't do that.")
  }
}

//Removes a connection from the edges array and from the graph.
function removeConnection(start, end, weight) {
  exiledEdge = new Edge(start, end, weight)
  id = start + "--" + end

  console.log("Removing " + id + "from the original edges array.")
  edges.splice(edges.indexOf(exiledEdge), 1)
  console.log(edges)

  //Delete them visually from the graph.
  cy.remove(cy.$('#' + id))

  updateLists();

}