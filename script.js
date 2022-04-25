const container = document.querySelector(".repo-container");
const searchContainer = document.querySelector(".search");
const search = document.querySelector(".search__input");
const cardList = document.querySelector(".list");

const debounce = (cb, debounceTime) => {
  let timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb.apply(this, arguments);
    }, debounceTime);
  };
};

const eventHandler = debounce((text) => {
  hideAutocomplete();
  if (text.trim() !== "") {
    searchRepos(text)
      .then((repos) => {
        repos.forEach((repository) => {
          addAutocomplete(repository);
        });
      })
      .catch((error) => console.log(error));
  }
}, 700);

async function searchRepos(searchText) {
  try {
    const result = await fetch(
      `https://api.github.com/search/repositories?q=${searchText}&per_page=5`
    );
    const repos = await result.json();
    if (repos.items.length < 1) {
      search.value = null;
      alert("No matching repositories");
    }

    return repos.items.slice(0, 5);
  } catch (e) {
    throw e;
  }
}

search.addEventListener("input", () => eventHandler(search.value));

const createCard = (repository) => {
  const cardItem = document.createElement("li");
  cardItem.classList.add("list__item");
  cardItem.innerHTML = `
    <div class="repo-card">
        <span class="repo-card__name">Name: ${repository.name}</span>
        <span class="repo-card__owner">Owner: ${repository.owner.login}</span>
        <span class="repo-card__stars">Stars: ${repository.stargazers_count}</span> 
    </div>
    <button class="button button__close"></button>
    `;
  cardList.append(cardItem);
  const buttonClose = cardItem.querySelector(".button__close");

  buttonClose.addEventListener("click", () => {
    cardItem.remove();
  }, {once: true})
  return cardItem;
};

function addAutocomplete(repository) {
  const autocomplete = document.createElement("div");
  autocomplete.textContent = repository.name;
  autocomplete.classList.add("search__options");
  searchContainer.appendChild(autocomplete);

  autocomplete.addEventListener("click", (e) => {
    hideAutocomplete(e.target);

    cardList.insertAdjacentElement("afterbegin", createCard(repository));

    search.value = null;
  }, {once: true});
}

function hideAutocomplete() {
  let optionsToHide = document.querySelectorAll(".search__options");
  for (let element of optionsToHide) {
    element.remove();
  }
}



