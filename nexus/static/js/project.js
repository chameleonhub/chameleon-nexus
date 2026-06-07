/* Project specific Javascript goes here. */

(function () {
  function isSelectSearchEvent(event) {
    return event.target && event.target.closest && event.target.closest(".desk-select-search-option");
  }

  function preventSelectSearchClose(event) {
    if (!isSelectSearchEvent(event)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) {
      event.stopImmediatePropagation();
    }

    const input = event.target.closest(".desk-select-search-option").querySelector(".desk-select-search");
    if (input) {
      input.focus();
    }
  }

  ["click", "mousedown", "mouseup", "pointerdown", "pointerup", "touchstart", "touchend"].forEach(function (eventName) {
    document.addEventListener(eventName, preventSelectSearchClose, true);
  });

  function filterDropdownOptions(searchInput, dropdown) {
    const query = searchInput.value.trim().toLowerCase();
    const options = dropdown.querySelectorAll("li:not(.desk-select-search-option)");

    options.forEach(function (option) {
      const text = option.textContent.trim().toLowerCase();
      option.style.display = text.includes(query) ? "" : "none";
    });
  }

  function addSearchToSelectWrapper(wrapper) {
    const dropdown = wrapper.querySelector(".dropdown-content");
    if (!dropdown || dropdown.querySelector(".desk-select-search-option")) {
      return;
    }

    const searchItem = document.createElement("li");
    searchItem.className = "desk-select-search-option disabled";
    searchItem.innerHTML = '<input class="desk-select-search" type="search" placeholder="Search options" autocomplete="off">';
    dropdown.insertBefore(searchItem, dropdown.firstChild);

    const searchInput = searchItem.querySelector("input");
    function keepDropdownOpen(event) {
      preventSelectSearchClose(event);
    }

    ["click", "mousedown", "mouseup", "pointerdown", "pointerup", "touchstart", "touchend"].forEach(function (eventName) {
      searchItem.addEventListener(eventName, keepDropdownOpen, true);
      searchInput.addEventListener(eventName, keepDropdownOpen, true);
    });

    searchInput.addEventListener("keydown", function (event) {
      event.stopPropagation();
      if (event.stopImmediatePropagation) {
        event.stopImmediatePropagation();
      }
      if (event.key === "Escape") {
        searchInput.blur();
      }
    }, true);
    searchInput.addEventListener("input", function () {
      filterDropdownOptions(searchInput, dropdown);
    });

    const trigger = wrapper.querySelector("input.select-dropdown");
    if (trigger) {
      trigger.addEventListener("click", function () {
        window.setTimeout(function () {
          searchInput.value = "";
          filterDropdownOptions(searchInput, dropdown);
          searchInput.focus();
        }, 80);
      });
    }
  }

  window.initSearchableSelects = function (root) {
    const scope = root && root.jquery ? root.get() : [root || document];
    scope.forEach(function (node) {
      const wrappers = node.matches && node.matches(".select-wrapper")
        ? [node]
        : node.querySelectorAll
          ? node.querySelectorAll(".select-wrapper")
          : [];
      wrappers.forEach(addSearchToSelectWrapper);
    });
  };

  if (window.jQuery && jQuery.fn && jQuery.fn.formSelect) {
    const originalFormSelect = jQuery.fn.formSelect;
    jQuery.fn.formSelect = function (options) {
      const mergedOptions = Object.assign({}, options || {});
      mergedOptions.dropdownOptions = Object.assign(
        {
          coverTrigger: false,
        },
        mergedOptions.dropdownOptions || {}
      );

      const result = originalFormSelect.call(this, mergedOptions);
      window.setTimeout(function () {
        window.initSearchableSelects(document);
      }, 0);
      return result;
    };
  }

  document.addEventListener("DOMContentLoaded", function () {
    window.initSearchableSelects(document);
  });
})();
