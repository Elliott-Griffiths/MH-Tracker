'use strict';

// ----- VARIABLES --------

let username = "";
let password = "";

// Array of graph objects
const graphs = [
  { id: "graph1", name: "Heat Surge", color: "kuro" },
  { id: "graph2", name: "Hot Cheeks / Face", color: "ajisai" },
  { id: "graph3", name: "Nausea/Sickness, Headache, Chest/Stomach Pains", color: "ichou" },
  { id: "graph4", name: "Crying Bursts", color: "sora" },
  { id: "graph5", name: "Foreboding, Scared, Losing Mind, Unable to Carry on", color: "momiji" },
  { id: "graph6", name: "Positive Moments", color: "shibafu" }
];

// ----- FUNCTIONS --------

// Get the appropriate greeting based on the current hour
const getGreeting = () => {
  const currentDate = new Date();
  const currentHour = currentDate.getHours();

  let greeting;

  if (currentHour >= 0 && currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour >= 12 && currentHour < 18) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }
  return greeting;
};

// Load form section action
const loadSection = async (section, label, eventData) => {
  const navIDs = ["homeLink", "recordLink", "detailsLink", "profileLink"];

  // Iterate over the navIDs array
  navIDs.forEach((id) => {
    const element = document.getElementById(id); // Get the element by its ID
    if (element) element.classList.remove("active");
  });

  try {
    // Load the HTML content for the specified section
    const response = await fetch(`html/${section}.html`);
    const data = await response.text();
    document.getElementById("main").innerHTML = data;
    
    // Call the sectionLoadedEventHandler to handle the loaded section
    sectionLoadedEventHandler(section, label, eventData);
  } catch (error) {
    console.error(`Error loading ${section}.html: ${error}`);
  }
};

// Load form section event handler
const sectionLoadedEventHandler = (section, label, eventData) => {
  if (section !== 'index' && section !== 'create_user' && section !== 'user_login') {
    // Show the footer navigation if the section is not 'index', 'create_user', or 'user_login'
    document.getElementById('footer-nav').classList.remove('hidden');
    document.getElementById('copywrite').classList.add('hidden');  
  }
  
  if (section === 'home') {
    // Update the greeting message in the 'home' section
    document.getElementById("greeting").textContent = `${getGreeting()}, ${username}`;
    document.getElementById('homeLink').classList.add('active'); 
      
    // Fetch the graphs asynchronously in the 'home' section
    (async () => {
      for (const graph of graphs) {
        await fetchGraph(graph);
      }
    })();
  }
  
  if (section === 'record_event') {
    document.getElementById('recordLink').classList.add('active');   

    // Set the default date value to today's date in the 'record_event' section
    const dateInput = document.getElementById('date');
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;

    // Toggle visibility of input fields based on checkbox state in the 'record_event' section
    const checkbox = document.getElementById('myCheckbox');
    const input = document.querySelectorAll('#date-field, #num-field');

    checkbox.addEventListener('change', (event) => {
      if (event.target.checked) {
        input.forEach((element) => {
          element.classList.remove('hidden');
        });
      } else {
        input.forEach((element) => {
          element.classList.add('hidden');
        });
      }
    });
  }
  
  if (section === 'view_events') {
    document.getElementById('detailsLink').classList.add('active'); 
      
    // Update the event title in the 'view_events' section
    document.getElementById("event-title").textContent = label;
    
    // Populate the table with event data in the 'view_events' section
    const tableBody = document.getElementById('table-body');

    eventData.forEach((item) => {
      const row = document.createElement('tr');

      const dateCell = document.createElement('td');
      dateCell.textContent = item.date;
      row.appendChild(dateCell);

      const quantityCell = document.createElement('td');
      quantityCell.textContent = item.quantity;
      row.appendChild(quantityCell);

      tableBody.appendChild(row);
    });

    // Add accessibility attributes to the table headers
    const thElements = table.querySelectorAll('th');
    thElements.forEach((th, index) => {
      th.setAttribute('scope', 'col');
    });
  }
    
    if (section === 'view_events') {
      document.getElementById('profileLink').classList.add('active');
    }
};

// Format date
const formatDate = (dateString) => {
  const year = dateString.substr(0, 4);
  const month = dateString.substr(4, 2) - 1;
  const day = dateString.substr(6, 2);
  const date = new Date(year, month, day);
  const options = { weekday: 'short', day: 'numeric', month: 'short' };
  const formatter = new Intl.DateTimeFormat('en-GB', options);
  return formatter.format(date).replace(/(\d+)(st|nd|rd|th)/, '$1<sup>$2</sup>');
};

// Add data to table
const addDataToTable = (label, data) => {
  // Check if the data.pixels property is an array
  if (!Array.isArray(data.pixels)) {
    console.error('Invalid data format. Expected an array in the "pixels" property.', data.pixels);
    return;
  }
  
  // Format the pixel data for display in the table
  const eventData = data.pixels.map((pixel) => ({
    date: formatDate(pixel.date),
    quantity: pixel.quantity
  }));

  // Load the section with the event data into the view
  loadSection('view_events', label, eventData);
};

// ----- API CALLS --------

// Retrieve graph SVG
const fetchGraph = async (graph) => {
  const { id, name } = graph;

  try {
    // Construct the API URL for the current graph
    const apiUrl = `https://pixe.la/v1/users/${username}/graphs/${id}?mode=short&appearance=light`;

    // Fetch the SVG from the API URL
    const response = await fetch(apiUrl);
    const svgData = await response.text();

    // Create a new SVG element
    const parser = new DOMParser();
    const svgElement = parser.parseFromString(svgData, "image/svg+xml").querySelector('svg');

    // Create a container div for the graph
    const graphContainer = document.createElement('div');
    graphContainer.id = `graph-${id}`;
    graphContainer.classList.add('graph-container');

    // Create a heading for the graph
    const heading = document.createElement('h2');
    heading.textContent = name;

    // Append the SVG and heading to the container div
    graphContainer.appendChild(heading);
    graphContainer.appendChild(svgElement);

    // Append the container div to the main graph container
    const mainContainer = document.getElementById('graph-container');
    mainContainer.appendChild(graphContainer);
  } catch (error) {
    console.error(`Error fetching graph ${id}:`, error);
  }
};

// Authenticate user
const getUserProfile = async (username, password) => {
  // Construct the URL for updating the user profile
  const url = `https://pixe.la/${username}`;
  
  // Construct the options object for the PUT request
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-USER-TOKEN': password,
    },
    body: JSON.stringify({
      displayName: username,
    }),
  };
  
  // Send the PUT request to update the user profile
  const response = await fetch(url, options);
  const data = await response.json();

  if (response.status !== 200 &&
      data.message.includes("Please retry this request.")) {
    // Retry the request after a short delay
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  
  const loginError = document.querySelectorAll('#failed-login');
  if (!data.isSuccess &&
    data.message.includes('does not exist or the token is wrong')) {
    loginError.classList.remove('hidden');
  } else {
    loginError.classList.add('hidden');
  }

  if (data.isSuccess) {
    // Load the 'home' section if the request was successful
    loadSection('home');
  }
};

// Create new pixel graphs
const createGraphs = async () => {
    for (const graph of graphs) {
      const url = `https://pixe.la/v1/users/${username}/graphs`;
      const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-USER-TOKEN': password,
      },
      body: JSON.stringify({
        id: graph.id,
        name: graph.name,
        unit: 'hour',
        type: 'int',
        color: graph.color,
        timezone: "Europe/London",
        isSecret: true,
        publishOptionalData: false
      }),
    };

    let response, data;
    do {
      response = await fetch(url, options);
      data = await response.json();

      if (response.status !== 200 &&
        data.message.includes("Please retry this request.")) {
        // Retry the request after a short delay
        await new Promise((resolve) => setTimeout(resolve, 100));
      } else {
        // Log the response message and exit the loop
        console.log(data.message);
        break;
      }
    } while (true);

    if (response.status >= 200 && response.status < 300) {
      // Load the 'record_event' section if the request was successful
      loadSection("record_event");
    }
  }
};

// Create a new user account
const createUser = async () => {
  const url = `https://pixe.la/v1/users`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-USER-TOKEN": password,
    },
    body: JSON.stringify({
      token: password,
      username: username,
      agreeTermsOfService: "yes",
      notMinor: "yes",
    }),
  };
    
  let response, data;
  do {
    response = await fetch(url, options);
    data = await response.json();

    if (response.status !== 200 &&
      data.message.includes("Please retry this request.")) {
      // Retry the request after a short delay
      await new Promise((resolve) => setTimeout(resolve, 100));
    } else {
      // Log the response message and exit the loop
      console.log(data.message);
      break;
    }
  } while (true);

  if (data.isSuccess) {
    // Call createGraphs() if the account creation was successful
    createGraphs();
  }
};

// Add pixel(s) to graph
const createPixel = async (id, date, count) => {
  // Convert the date string to a Date object
  date = new Date(date);
  
  // Extract year, month, and day from the date object
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Construct the URL for creating a pixel
  const url = `https://pixe.la/v1/users/${username}/graphs/${id}`;
  
  // Construct the options object for the POST request
  const options = {
    method: "POST",
    headers: {
      "X-USER-TOKEN": '123456789',
      "Content-Length": "0",
    },
    body: JSON.stringify({
      date: `${year}${month}${day}`,
      quantity: count,
    }),
  };
  
  let response, data;
  do {
    response = await fetch(url, options);
    data = await response.json();

    if (response.status !== 200 &&
      data.message.includes("Please retry this request.")) {
      // Retry the request after a short delay
      await new Promise((resolve) => setTimeout(resolve, 100));
    } else {
      // Log the response message and exit the loop
      console.log(data.message);
      break;
    }
  } while (true);

  if (data.isSuccess) {
    // Load the 'home' section if the request was successful
    loadSection("home");
  }
};

// Add pixel to and increate pixel count on graph
const increasePixel = async (id) => {
  // Construct the URL for increasing a pixel
  const url = `https://pixe.la/v1/users/${username}/graphs/${id}/increment`;
  
  // Construct the options object for the PUT request
  const options = {
    method: "PUT",
    headers: {
      "X-USER-TOKEN": '123456789',
      "Content-Length": "0",
    },
  };

  let response, data;
  do {
    response = await fetch(url, options);
    data = await response.json();

    if (response.status !== 200 &&
      data.message.includes("Please retry this request.")) {
      // Retry the request after a short delay
      await new Promise((resolve) => setTimeout(resolve, 100));
    } else {
      // Log the response message and exit the loop
      console.log(data.message);
      break;
    }
  } while (true);

  if (data.isSuccess) {
    // Load the 'home' section if the request was successful
    loadSection("home");
  }
};

// Retrieve graph details
const retrieveGraphDetails = async (id, label, from, to) => {
  const url = `https://pixe.la/v1/users/${username}/graphs/${id}/pixels?withBody=true&from=${from}&to=${to}`;
  const options = {
    method: "GET",
    headers: {
      "X-USER-TOKEN": password,
    },
  };
    
  let response, data;
  do {
    // Make a request to retrieve graph details
    response = await fetch(url, options);
    data = await response.json();

    if (data.message) {
      // Check if the response message indicates a retry is needed
      if (data.message.includes("Please retry this request.")) {
        // Wait for a short period before retrying
        await new Promise((resolve) => setTimeout(resolve, 100));
      } else {
        console.log(data.message);
        break;
      }
    } else {
      // Add the retrieved data to the table
      addDataToTable(label, data);
      break;
    }
  } while (true);
};

// Delete account
const deleteAccount = async () => {
  const url = `https://pixe.la/v1/users/${username}`;
  const options = {
    method: 'DELETE',
    headers: {
      'X-USER-TOKEN': password
    }
  }

  let response, data;
  do {
    response = await fetch(url, options);
    data = await response.json();

    if (response.status !== 200 &&
      data.message.includes("Please retry this request.")) {
      // Retry the request after a short delay
      await new Promise((resolve) => setTimeout(resolve, 100));
    } else {
      // Log the response message and exit the loop
      console.log(data.message);
      location.reload();
    }
  } while (true);
};

// ----- BUTTON ACTIONS ---

// Handle user action buttons
const userActionBtn = event => {
  event.preventDefault();
  const buttonId = event.submitter.id;
  if (buttonId === "loginBtn") {
      loadSection("user_login");
  }
  if (buttonId === "createBtn") {
      loadSection("create_user");
  }
};

// Create user button
const createUserBtn = event => {
  event.preventDefault();
  username = document.getElementById('username').value;
  password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const alertMessage = document.getElementById('alert-message');
    
  if (password !== confirmPassword) {
    alertMessage.classList.remove('hidden');
  } else {
    alertMessage.classList.add('hidden');
    createUser();
  }
};

// User login button
const userLoginBtn = event => {
  event.preventDefault();
  // Get the username and password values from the input fields
  username = document.getElementById('username').value;
  password = document.getElementById('password').value;
  
  // Uncomment the following line if there is a getUserProfile(username, password) function
  // getUserProfile(username, password);
  
  // Load the 'home' section
  loadSection('home');
};

// Record event button
const recordEventBtn = event => {
  event.preventDefault();
  // Get the checkbox, id, date, and count values from the input fields
  const checkbox = document.getElementById('myCheckbox');
  const id = document.getElementById('selection').value;
  const date = document.getElementById('date').value;
  const count = document.getElementById('number').value;
  
  if (checkbox.checked) {
    // If the checkbox is checked, create a new pixel
    createPixel(id, date, count);
  } else {
    // If the checkbox is not checked, increase the count of an existing pixel
    increasePixel(id);
  }
};

// Retrieve events button click handler
const retrieveEventBtn = event => {
  event.preventDefault();
  
  // Get the selected graph ID and label
  const selection = document.getElementById('selection');
  const id = selection.value;
  const label = selection.options[selection.selectedIndex].text;
  
  // Get the date range input values and format them
  const from = document.getElementById('date-from').value.split('-').join('');
  const to = document.getElementById('date-to').value.split('-').join('');
  
  // Retrieve graph details using the provided inputs
  retrieveGraphDetails(id, label, from, to);
};

// View events button
const viewEventsBtn = event => {
  event.preventDefault();
  loadSection('retrieve_events');
};

// User profile buttons
const userProfileBtn = event => {
  event.preventDefault();
  const buttonId = event.submitter.id;
  if (buttonId === "logoutBtn") {
    // Reload the page for logout button
    location.reload();
  }
  if (buttonId === "deleteBtn") {
    // Call the deleteAccount function for delete button
    deleteAccount();
  }
};

// ----- NAVIGATION ------

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Define an array of links with their corresponding sections
  const links = [
    { id: "homeLink", section: "home" },
    { id: "recordLink", section: "record_event" },
    { id: "detailsLink", section: "retrieve_events" },
    { id: "profileLink", section: "user_profile" }
  ];

  // Add click event listeners to each link
  links.forEach(link => {
    const button = document.getElementById(link.id);
    button.addEventListener("click", () => {
      // Load the corresponding section when a link is clicked
      loadSection(link.section);
      // Set the clicked button as active
      setActiveButton(link.id);
    });
  });

  // Set the active button based on the given buttonId
  const setActiveButton = buttonId => {
    links.forEach(link => {
      const button = document.getElementById(link.id);
      if (link.id === buttonId) {
        // Add the "active" class to the button if it matches the buttonId
        button.classList.add("active");
      } else {
        // Remove the "active" class from the button if it doesn't match the buttonId
        button.classList.remove("active");
      }
    });
  };
});
