const toggles = {
  master: document.getElementById('toggle-master'),
  text: document.getElementById('toggle-text'),
  image: document.getElementById('toggle-image')
};

chrome.storage.local.get(['shield_master', 'shield_text', 'shield_image'], (data) => {
  if (data.shield_master !== undefined) toggles.master.checked = data.shield_master;
  if (data.shield_text !== undefined) toggles.text.checked = data.shield_text;
  if (data.shield_image !== undefined) toggles.image.checked = data.shield_image;
});

function saveSettings() {
  chrome.storage.local.set({
    shield_master: toggles.master.checked,
    shield_text: toggles.text.checked,
    shield_image: toggles.image.checked
  });
}

toggles.master.addEventListener('change', saveSettings);
toggles.text.addEventListener('change', saveSettings);
toggles.image.addEventListener('change', saveSettings);
