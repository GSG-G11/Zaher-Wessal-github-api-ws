(() => {
	let username = "zaher-aa";

	const globalUrl = `https://api.github.com/users/${username}`;
	const reposUrl = `https://api.github.com/users/${username}/repos`;
	let allLanguages = [];

	function $(selector) {
		return document.querySelector(selector);
	}

	function fetch(url, callback) {
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					const response = JSON.parse(xhr.responseText);
					return callback(response);
				} else {
					console.log("Status Code: " + xhr.status);
				}
			}
		};

		xhr.open("GET", url);
		xhr.send();
	}

	function globalEndpointEdits(response) {
		$("#github-user-handle").textContent = response.name;
		$("#github-user-link").href = response.html_url;
		$("#github-user-avatar").src = response.avatar_url;
		$("#github-user-repos").textContent = response.public_repos;
	}

	function totalStarsCount(response) {
		return response.reduce((acc, cur) => acc + cur.stargazers_count, 0);
	}

	function getContributor(res) {
		const contributors = res.reduce((acc, cur) => {
			acc.push(cur.login);
			return acc;
		}, []);
		$("#github-repo-contributors").append(contributors.join(" - "));
	}

	function topRepo(repo) {
		$("#github-repo-name").textContent = repo.name;
		$("#github-repo-created").textContent = repo.created_at;
		$("#github-repo-open-issues").textContent = repo.open_issues_count;
		$("#github-repo-watchers").textContent = repo.watchers_count;
		$("#github-repo-contributors").innerHTML = "";
		fetch(repo.contributors_url, getContributor);
	}

	function languages(repoApi, idx, self) {
		fetch(repoApi, (res) => {
			Object.keys(res).forEach((lang) => {
				if (allLanguages.indexOf(lang) === -1) allLanguages.push(lang);
			});
			if (idx === self.length - 1) {
				$("#github-repos-languages").textContent = allLanguages.join(" - ");
			}
		});
	}

	function reposHandler(response) {
		$("#github-repos-stars").textContent = totalStarsCount(response);
		topRepo(response[0]);
		allLanguages = [];
		response.forEach((res, idx, self) =>
			languages(res.languages_url, idx, self)
		);
	}

	fetch(globalUrl, globalEndpointEdits);
	fetch(reposUrl, reposHandler);

	$("form").onsubmit = (e) => {
		e.preventDefault();
		const userToSearch = $(".input-field").value;
		if (userToSearch.trim() !== "") {
			username = userToSearch;
			fetch(`https://api.github.com/users/${username}`, globalEndpointEdits);
			fetch(`https://api.github.com/users/${username}/repos`, reposHandler);
		}
	};
})();
