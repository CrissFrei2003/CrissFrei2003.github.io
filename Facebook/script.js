// Sidebar: toggle "See more" additional items
document.addEventListener('DOMContentLoaded', function () {
	var seeMoreBtn = document.getElementById('see-more-btn');
	var moreItems = document.getElementById('more-items');
	if (seeMoreBtn && moreItems) {
		seeMoreBtn.addEventListener('click', function (e) {
			// prevent default/propagation to avoid unexpected console logs/alerts from other handlers
			e.preventDefault();
			e.stopPropagation();
			var isHidden = moreItems.hasAttribute('hidden');
			if (isHidden) {
				moreItems.removeAttribute('hidden');
				seeMoreBtn.querySelector('.sidebar-text').textContent = 'See less';
			} else {
				moreItems.setAttribute('hidden', '');
				seeMoreBtn.querySelector('.sidebar-text').textContent = 'See more';
			}
		});
	}

	// Nav buttons: mark active on click (visual feedback)
	var navBtns = document.querySelectorAll('.main-nav .nav-btn');
	navBtns.forEach(function (btn) {
		btn.addEventListener('click', function () {
			navBtns.forEach(function (b) { b.classList.remove('active'); });
			btn.classList.add('active');
		});
	});

	// Stories modal behavior
	var stories = document.querySelectorAll('.story');
	var storyModal = document.getElementById('story-modal');
	var modalContent = document.getElementById('modal-content');
	var storyClose = document.getElementById('story-close');

	stories.forEach(function (s) {
		s.addEventListener('click', function () {
			var large = s.getAttribute('data-large');
			if (large && modalContent) {
				modalContent.style.backgroundImage = 'url("' + large + '")';
				storyModal.classList.add('open');
				storyModal.setAttribute('aria-hidden', 'false');
			}
		});
	});

	function closeStory() {
		if (storyModal) {
			storyModal.classList.remove('open');
			storyModal.setAttribute('aria-hidden', 'true');
			modalContent.style.backgroundImage = '';
		}
	}

	if (storyClose) storyClose.addEventListener('click', closeStory);
	if (storyModal) storyModal.addEventListener('click', function (e) { if (e.target === storyModal) closeStory(); });

	// Dark mode toggle
	var darkToggle = document.getElementById('dark-toggle');
	function applyDark(enabled) {
		if (enabled) {
			document.body.classList.add('dark');
			localStorage.setItem('fb_dark', '1');
			if (darkToggle) { darkToggle.textContent = '☀️'; darkToggle.setAttribute('aria-pressed', 'true'); }
		} else {
			document.body.classList.remove('dark');
			localStorage.setItem('fb_dark', '0');
			if (darkToggle) { darkToggle.textContent = '🌙'; darkToggle.setAttribute('aria-pressed', 'false'); }
		}
	}
	// initialize from storage
	var saved = localStorage.getItem('fb_dark');
	// default to dark unless user explicitly set '0'
	if (saved === '0') applyDark(false);
	else applyDark(true);
	if (darkToggle) {
		darkToggle.addEventListener('click', function () { applyDark(!document.body.classList.contains('dark')); });
	}
});
