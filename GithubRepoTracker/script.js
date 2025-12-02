(function () {
  const btn = document.getElementById("getRepositryBtn");
  const repoContainer = $("#repositories");
  const perPageSelect = document.getElementById("perPageSelect");

  let currentPage = 1;
  let perPage = 10;

  async function fetchRepositories(page = 1, newPerPage) {
    const username = document.getElementById("username").value.trim();
    if(!username) return alert("Please enter a valid GitHub username.");

    repoContainer.html(
      `<div class="spinner-border text-primary" role="status"></div>`
    );

    const apiURL = `https://api.github.com/users/${username}/repos?per_page=${newPerPage || perPage}&page=${page}`;

    try {
      const response = await fetch(apiURL);
      const repos = await response.json();

      if(!Array.isArray(repos)) {
        repoContainer.html("<p class='text-danger'>User not found.</p>");
        return;
      }

      displayProfile(repos[0]?.owner?.login);
      displayRepositories(repos);
    } catch(err) {
      repoContainer.html(`<p class="text-danger">${err.message}</p>`);
    }
  }

  async function displayProfile(username) {
    if(!username) return;
    const profileBox = $("#profile");

    const res = await fetch(`https://api.github.com/users/${username}`);
    const user = await res.json();

    profileBox.html(`
      <img id="user_img" src="${user.avatar_url}" alt="">
      <div id="right-details">
        <h4>${user.name ?? ""}</h4>
        <span class="username">@${user.login}</span>
        <p>${user.bio ?? ""}</p>
        <span><b>${user.followers}</b> followers • <b>${user.following}</b> following</span>
        <span><span class="material-symbols-outlined">location_on</span>${user.location ?? "N/A"}</span>
      </div>
    `);
  }

  function displayRepositories(repos) {
    repoContainer.empty();

    repos.forEach(async (repo) => {
      const langRes = await fetch(repo.languages_url);
      const languages = await langRes.json();

      const langButtons = Object.keys(languages)
        .map((lang) => `<span class="btn btn-primary">${lang}</span>`)
        .join("");

      const card = `
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">
              <a href="${repo.html_url}" target="_blank">${repo.name}</a>
            </h5>
            <p>${repo.description ?? "No description"}</p>
            <div class="languages-container">${langButtons}</div>
          </div>
        </div>
      `;

      repoContainer.append(card);
    });
  }

  btn.addEventListener("click", () => fetchRepositories());
  perPageSelect.addEventListener("change", (e) => {
    perPage = Number(e.target.value);
    fetchRepositories(1, perPage);
  });
})();
