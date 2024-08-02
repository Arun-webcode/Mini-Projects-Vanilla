(function () {
  const getRepositoryBtn = document.getElementById("getRepositryBtn");
  const repositoriesContainer = $("#repositories");
  const paginationContainer = $("#pagination");
  const perPageSelect = document.getElementById("perPageSelect");

  let currentPage = 1;
  let totalPages = 0;
  let perPage = 10; // Default perPage value

  async function fetchRepositories(page, newPerPage) {
    const usernameInput = document.getElementById("username");
    const username = usernameInput.value.trim();

    if (!username) {
      alert(
        "Welcome to Github Repositories Tracker. click ok and enter github valid user name..."
      );
      return;
    }

    const apiUrl = `https://api.github.com/users/${username}/repos?per_page=${
      newPerPage || perPage
    }&page=${page}`;

    repositoriesContainer.html(
      '<div class="spinner-border" role="status"><span class="sr-only"></span></div>'
    );

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Error fetching repositories.");
      }

      const data = await response.json();
      totalPages = Math.ceil(data.length / perPage); // Calculate total pages
      displayRepositories(data);
      generatePagination(); // Generate pagination links
    } catch (error) {
      repositoriesContainer.html(`<p class="text-danger">${error.message}</p>`);
    }
  }

  function displayRepositories(repositories) {
    const profileContainer = $("#profile");
    repositoriesContainer.empty();

    if (repositories.length === 0) {
      repositoriesContainer.html(
        '<p class="text-info">No repositories found.</p>'
      );
      return;
    }

    const repo = repositories[0]; // Assuming you are displaying information for the first repository

    // Fetch detailed user information
    fetch(`https://api.github.com/users/${repo.owner.login}`)
      .then((response) => response.json())
      .then((user) => {
        // Modify the HTML content to display user profile information
        profileContainer.html(`
            <div class="profile">
              <img id="user_img" class="img-thumbnail" src="${user.avatar_url}" alt="Profile picture" />
              <div id="f-f-u" class="center-align">
                <span class="material-symbols-outlined">supervisor_account</span>
                <h6>${user.followers} followers - ${user.following} following</h6>
              </div>
              <h6 class="center-align">
                <span class="material-symbols-outlined">link</span> ${user.html_url}
              </h6>
            </div>
            <div id="right-details">
              <span class="name"><b>${user.name}</b></span>
              <span class="username">${user.login}</span>
              <p class="bio">${user.bio}</p>
              <span class="location"><span class="material-symbols-outlined">location_on</span>${user.location}</span>
              <span class="twitter">Twitter: @${user.twitter_username}</span>
            </div>
          `);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        // Handle error in user data fetch
        profileContainer.html(
          '<p class="text-danger">Error fetching user data.</p>'
        );
      });

    repositories.forEach((repo) => {
      // Fetch language data from the provided languages_url
      fetch(repo.languages_url)
        .then((response) => response.json())
        .then((languages) => {
          // Create a div to hold the language buttons
          const languagesDiv = document.createElement("div");
          languagesDiv.className = "languages-container";

          // Iterate through the languages and create buttons
          for (const language of Object.keys(languages)) {
            const languageButton = document.createElement("span");
            languageButton.className = "btn btn-primary";
            languageButton.textContent = language;

            // Append the button to the div
            languagesDiv.appendChild(languageButton);
          }

          // Append the language div to the card body
          const cardBody = document.createElement("div");
          cardBody.className = "card-body";
          cardBody.innerHTML = `
                    <h5 class="card-title"><a style="text-decoration: none; color: black;" href="${
                      repo.html_url
                    }">${repo.name}</a></h5>
                    <p class="card-text">${
                      repo.description || "No description available."
                    }</p>
                `;
          cardBody.appendChild(languagesDiv);

          // Create the card div and append the card body
          const cardDiv = document.createElement("div");
          cardDiv.style.width = "45%";
          cardDiv.className = "card mb-3";
          cardDiv.appendChild(cardBody);

          // Append the card div to the repositories container
          repositoriesContainer.append(cardDiv);
        })
        .catch((error) => {
          console.error("Error fetching language data:", error);
        });
    });
  }

  function generatePagination() {
    paginationContainer.html(""); // Clear previous pagination links

    const pageLinks = [];
    for (let i = 1; i <= totalPages; i++) {
      const link = `<li class="page-item ${i === currentPage ? "active" : ""}">
                           <a class="page-link" href="#" onclick="fetchRepositories(${i})">${i}</a>
                         </li>`;
      pageLinks.push(link);
    }

    paginationContainer.html(pageLinks.join(""));
  }

  getRepositoryBtn.addEventListener("click", fetchRepositories);
  perPageSelect.addEventListener("change", (event) => {
    perPage = parseInt(event.target.value);
    currentPage = 1; // Reset to first page when perPage changes
    fetchRepositories(currentPage);
  });

  fetchRepositories(currentPage); // Initial fetch on page load
})();
