const db_url = "https://script.google.com/macros/s/AKfycbwxd-tKBI8t_CzVlf65zwLq_mGoWA8aG7YQ6d3Ly8-nQUtfP8o2wjcrYx66FdZyqWlT/exec";

// Get HTML elements
const adminBtn = document.getElementById("admin-btn");
const adminLogin = document.getElementById("admin-login");
const userResponses = document.getElementById("user-responses");
const themeBtn = document.getElementById("toggle-theme");
const contactForm = document.getElementById("contact-form");
const adminForm = document.getElementById("admin-form");

// Admin login section
if (adminBtn && adminLogin) {
  adminBtn.addEventListener("click", function () {
    adminLogin.style.display = "block";
  });
}

// Dark/light theme toggle
if (themeBtn) {
  themeBtn.addEventListener("click", function () {
    document.body.classList.toggle("dark-theme");
  });
}

// Submit contact form
if (contactForm) {
  contactForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("input-name")?.value.trim();
    const email = document.getElementById("input-email")?.value.trim();
    const msg = document.getElementById("input-msg")?.value.trim();

    if (!name || !email || !msg) {
      alert("Please fill in all contact form fields.");
      return;
    }

    try {
      const response = await fetch(db_url, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
          action: "save_message",
          name: name,
          email: email,
          msg: msg
        })
      });

      const result = await response.json();

      if (result.success) {
        alert("Message submitted successfully!");
        contactForm.reset();
      } else {
        alert(result.message || "Message could not be saved.");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      alert("Unable to submit the message. Check the API and deployment.");
    }
  });
}

// Admin login
if (adminForm) {
  adminForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username =
      document.getElementById("input-username")?.value.trim();
    const password =
      document.getElementById("input-password")?.value;

    if (!username || !password) {
      alert("Enter your username and password.");
      return;
    }

    try {
      const response = await fetch(db_url, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
          action: "login",
          username: username,
          password: password
        })
      });

      const result = await response.json();

      if (result.success) {
        alert("Login successful!");

        if (adminLogin) adminLogin.style.display = "none";
        if (userResponses) userResponses.style.display = "block";

        await getUserMessages();
      } else {
        alert(result.message || "Access denied. Try again.");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      alert("Unable to log in. Check the API configuration.");
    }
  });
}

// Fetch submitted contact messages
async function getUserMessages() {
  try {
    const response = await fetch(db_url);
    const result = await response.json();

    if (!result.success) {
      alert(result.message || "Could not fetch messages.");
      return;
    }

    const messagesDiv = document.getElementById("user-messages");

    if (!messagesDiv) {
      console.error('HTML element "user-messages" was not found.');
      return;
    }

    // Clear previous results to avoid duplicate display
    messagesDiv.replaceChildren();

    (result.messages || []).forEach(function (item) {
      const messageDiv = document.createElement("div");

      const fields = [
        ["Name", item.name],
        ["Email", item.email],
        ["Message", item.msg ?? item.message],
        ["Date", item.date]
      ];

      fields.forEach(function ([label, value]) {
        const paragraph = document.createElement("p");
        paragraph.textContent = label + ": " + (value || "");
        messageDiv.appendChild(paragraph);
      });

      messageDiv.appendChild(document.createElement("hr"));
      messagesDiv.appendChild(messageDiv);
    });

    if (!result.messages || result.messages.length === 0) {
      messagesDiv.textContent = "No messages received yet.";
    }
  } catch (error) {
    console.error("Fetch messages error:", error);
    alert("Unable to fetch messages. Check the Apps Script API.");
  }
}
