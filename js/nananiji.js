var gIsSearching = false;
var gSearchValue = 0;
var gSearchType = "";

window.onload = function() {
    document.getElementsByName("list_name")
        .forEach(function(e) {
            e.addEventListener("click", function() {
                updateUsedNumbers();
            });
        });

    document.getElementById("enable_3_34")
        .addEventListener("click", function() {
            updateUsedNumbers();
        });

    document.getElementById("enable_2_64")
        .addEventListener("click", function() {
            updateUsedNumbers();
        });

    document.getElementById("search-form")
        .addEventListener("submit", function(event) {
            event.preventDefault();
            parseRequest();
        });

    updateUsedNumbers();
}

function parseRequest() {
    if (gIsSearching) {
        return;
    }

    var regexp = new RegExp(/^[-+]?[0-9]+$/);
    gSearchValue = document.getElementById("search-value").value;
    gSearchType= document.getElementById("search-form").list_name.value;

    if (regexp.test(gSearchValue)) {
        var req = createRequest(gSearchValue, gSearchType);
        invokeRequest(req);
    } else {
        alert(`error while parsing: ${gSearchValue}`);
    }
}

function invokeRequest(payload) {
    gIsSearching = true;
    startSpinner();

    $.ajax({type: "post",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(payload),
            url: "https://gzfqbic20i.execute-api.ap-northeast-1.amazonaws.com/beta/"})
    .done(function(res) {
        var result = document.getElementById("result");

        var expr = res["expr"].replace(/\*/g, "×").replace(/\//g, "÷");
        var tweetUrl = makeTweetUrl(gSearchValue, expr, gSearchType);
        var searchTypeStr = getSearchTypeName(gSearchType);

        result.insertAdjacentHTML("afterbegin", `
            <div class="card mb-3 border-secondary">
                <div class="card-body">
                    <p class="card-title align-items-center h5">
                        ${gSearchValue}
                        <small class="ml-2 text-muted">${searchTypeStr}</small>
                        <a target="_blank" href="${tweetUrl}" class="ml-3 tweet-button-a">
                            <svg xlmns="http://www.w3.org/2000/svg" class="twitter-icon" viewBox="0 0 72 72">
                                <use xlink:href="#twitter" />
                            </svg>
                        </a>
                    </p>
                    <p class="card-text">
                        ${expr}
                    </p>
                </div>
            </div>
        `);
    })
    .fail(function(jqXHR, textStatus) {
        alert("server error");
    })
    .always(function() {
        gIsSearching = false;
        stopSpinner();
    });
}

function updateUsedNumbers() {
    var searchMode = document.querySelector("input:checked[name=list_name]").id;
    var usedNumbersElem = document.getElementById("used_numbers");
    var enable_3_34 = document.getElementById("enable_3_34");
    var enable_2_64 = document.getElementById("enable_2_64");

    if (searchMode == "nananiji") {
        usedNumbersElem.innerText = "[(227), (22, 7), (2, 2, 7)]";
        enable_3_34.disabled = true;
        enable_2_64.disabled = true;
    } else if (searchMode == "hanshin") {
        if (enable_3_34.checked) {
            usedNumbersElem.innerText = "[(334), (33, 4), (3, 34), (3, 3, 4)]";
        } else {
            usedNumbersElem.innerText = "[(334), (33, 4), (3, 3, 4)]";
        }
        enable_3_34.disabled = false;
        enable_2_64.disabled = true;
    } else if (searchMode == "kyojin") {
        if (enable_2_64.checked) {
            usedNumbersElem.innerText = "[(264), (26, 4), (2, 64), (2, 6, 4)]";
        } else {
            usedNumbersElem.innerText = "[(264), (26, 4), (2, 6, 4)]";
        }
        enable_3_34.disabled = true;
        enable_2_64.disabled = false;
    }
}

function createRequest(searchValue, searchType) {
    if (searchType == "nananiji") {
        return {
            value: searchValue,
            list_name: {
                name: searchType
            }
        };
    } else {
        if (searchType == "hanshin") {
            var is_split = document.getElementById("search-form").enable_3_34.checked;
        } else {
            var is_split = document.getElementById("search-form").enable_2_64.checked;
        }
        return {
            value: searchValue,
            list_name: {
                name: searchType,
                split: is_split,
            }
        };
    }
}

function startSpinner() {
    document.getElementById('search-button-text').style.display = "none";
    document.getElementById('search-button-spinner').style.display = "block";
}

function stopSpinner() {
    document.getElementById('search-button-text').style.display = "inline";
    document.getElementById('search-button-spinner').style.display = "none";
}

function getSearchTypeName(search_type) {
    if (search_type == "nananiji") {
        return "ナナニジ算";
    } else if (search_type == "hanshin") {
        return "阪神算";
    } else if (search_type == "kyojin") {
        return "巨人算";
    } else {
        return null;
    }
}

function makeTweetUrl(value, expr, search_type) {
    var searchTypeStr = getSearchTypeName(search_type);
    var text = encodeURIComponent(value + "=" + expr + "｜" + document.title);
    var url = encodeURIComponent(location.url);
    var hashtags = encodeURIComponent("nhk_generator");
    return `http://twitter.com/share?text=${text}&url=${url}&hashtags=${hashtags}`;
}