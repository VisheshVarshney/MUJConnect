let successLogin = 1;
let currentUser  = null;
const posts = [
    {
        id: 1,
        username: "RahulKumar",
        content: "Just finished my exams! Freedom at last! 🎉",
        likes: 15,
        comments: [],
        timestamp: new Date(),
        anonymous: false,
        likedBy: [] // Track users who liked the post
    },
    {
        id: 2,
        username: "PriyaSharma",
        content: "The campus looks beautiful during monsoon! ☔",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ20X9xP3hkwj3aNmDhretK4XaLmhPdOrgmkQ&s",
        likes: 23,
        comments: [],
        timestamp: new Date(),
        anonymous: false,
        likedBy: [] // Track users who liked the post
    },
    {
        id: 3,
        username: "Anonymous",
        content: "Does anyone else think the canteen needs more variety?",
        likes: 45,
        comments: [],
        timestamp: new Date(),
        anonymous: true,
        likedBy: [] // Track users who liked the post
    }
];

let lastPostTime = new Date();
let lastCommentTime = new Date();

// Check URL parameters for login
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    if (username) {
        successLogin = 1;
        currentUser  = username;
        document.getElementById('loginBtn').innerHTML = `Welcome ${username}`;
        document.getElementById('postCreation').classList.remove('hidden');
        document.getElementById('loginBtn').addEventListener('click', function() {
            window.location.href = 'profile.html';
        });
    }
    renderPosts();
}

function renderPosts() {
    const container = document.getElementById('postsContainer');
    container.innerHTML = '';

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-card bg-white rounded-lg p-6 shadow-md';

        // Check if the current user has liked the post
        const isLiked = post.likedBy.includes(currentUser );

        postElement.innerHTML = `
            <div class="flex items-center mb-4">
                <div class="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center">
                    <i class="bi bi-person"></i>
                </div>
                <div class="ml-3">
                    <div class="font-semibold">${post.anonymous ? 'Anonymous' : post.username}</div>
                    <div class="text-gray-500 text-sm">${new Date(post.timestamp).toLocaleString()}</div>
                </div>
            </div>
            <p class="mb-4">${post.content}</p>
            ${post.image ? `<img src="${post.image}" class="post-image rounded-lg mb-4" alt="Post image">` : ''}
            <div class="flex items-center space-x-4">
                <button onclick="likePost(${post.id})" class="like-btn flex items-center space-x-1 ${isLiked ? 'liked' : ''}">
                    <i class="bi bi-heart"></i>
                    <span>${post.likes}</span>
                </button>
                <button onclick="showComments(${post.id})" class="flex items-center space-x-1">
                    <i class="bi bi-chat"></i>
                    <span>${post.comments.length} comments</span>
                </button>
            </div>
            <div class="comments-section mt-4 hidden" id="comments-${post.id}">
                <div class="space-y-2 mb-4">
                    ${post.comments.map(comment => `
                        <div class="bg-gray-50 p-3 rounded">
                            <div class="font-semibold">${comment.username}</div>
                            <div>${comment.content}</div>
                        </div>
                    `).join('')}
                </div>
                ${successLogin ? `
                    <div class="flex">
                        <input type="text" placeholder="Add a comment..." class="flex-1 p-2 border rounded-l">
                        <button onclick="addComment(${post.id}, this)" class="bg-blue-600 text-white px-4 rounded-r">Send</button>
                    </div>
                ` : ''}
            </div>
        `;
        container.appendChild(postElement);
    });
}

function createPost() {
    if (!successLogin) {
        alert('Please login to post');
        window.location.href = 'login.html';
        return;
    }

    const now = new Date();
    if (now - lastPostTime < 6000) { // 1 minute rate limit
        alert('Please wait before posting again');
        return;
    }

    const content = document.getElementById('postContent').value;
    if (!content.trim()) return;

    const anonymous = document.getElementById('anonymousCheck').checked;
    const imageInput = document.getElementById('imageInput');
    const image = imageInput.files.length > 0 ? URL.createObjectURL(imageInput.files[0]) : null;

    posts.unshift({
        id: posts.length + 1,
        username: currentUser ,
        content: content,
        image: image,
        likes: 0,
        comments: [],
        timestamp: new Date(),
        anonymous: anonymous,
        likedBy: [] // Initialize likedBy for new posts
    });

    document.getElementById('postContent').value = '';
    imageInput.value = '';
    lastPostTime = now;
    renderPosts();
}

function likePost(postId) {
    if (!successLogin) {
        alert('Please login to like posts');
        window.location.href = 'login.html';
        return;
    }

    const post = posts.find(p => p.id === postId);
    if (post) {
        const userIndex = post.likedBy.indexOf(currentUser );
        if (userIndex === -1) {
            // User has not liked the post yet
            post.likes += 1;
            post.likedBy.push(currentUser );
        } else {
            // User has already liked the post, so remove the like
            post.likes -= 1;
            post.likedBy.splice(userIndex, 1);
        }
        renderPosts();
    }
}

function showComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    commentsSection.classList.toggle('hidden');
}

function addComment(postId, btn) {
    if (!successLogin) {
        alert('Please login to comment');
        window.location.href = 'login.html';
        return;
    }

    const now = new Date();
    if (now - lastCommentTime < 30000) { // 30 seconds rate limit
        alert('Please wait 30 seconds before commenting again');
        return;
    }

    const input = btn.previousElementSibling;
    const content = input.value.trim();
    if (!content) return;

    const post = posts.find(p => p.id === postId);
    if (post) {
        post.comments.push({
            username: currentUser ,
            content: content
        });
        input.value = '';
        lastCommentTime = now;
        renderPosts();
    }
}

function showHome() {
    document.getElementById('homeSection').classList.remove('hidden');
    document.getElementById('vrSection').classList.add('hidden');
    document.getElementById('aboutSection').classList.add('hidden');
}

function showVRRouting() {
    document.getElementById('homeSection').classList.add('hidden');
    document.getElementById('vrSection').classList.remove('hidden');
    document.getElementById('aboutSection').classList.add('hidden');
}

function showAbout() {
    document.getElementById('homeSection').classList.add('hidden');
    document.getElementById('vrSection').classList.add('hidden');
    document.getElementById('aboutSection').classList.remove('hidden');
}

function toggleChat() {
    const chatbox = document.getElementById('chatbox');
    chatbox.classList.toggle('hidden');
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    if (input.value.trim()) {
        messages.innerHTML += `<div class="mb-2"><strong>You:</strong> ${input.value}</div>`;
        messages.innerHTML += `<div class="mb-2"><strong>Bot:</strong> I'm a simple bot. I can't help much yet!</div>`;
        input.value = '';
        messages.scrollTop = messages.scrollHeight;
    }
}

// Login script
let users = [];

function showSignIn() {
    document.getElementById('signInForm').classList.remove('hidden');
    document.getElementById('signUpForm').classList.add('hidden');
    document.getElementById('signInBtn').classList.add('bg-sky-600', 'text-white');
    document.getElementById('signInBtn').classList.remove('bg-sky-50', 'text-sky-600');
    document.getElementById('signUpBtn').classList.add('bg-sky-50', 'text-sky-600');
    document.getElementById('signUpBtn').classList.remove('bg-sky-600', 'text-white');
}

function showSignUp() {
    document.getElementById('signInForm').classList.add('hidden');
    document.getElementById('signUpForm').classList.remove('hidden');
    document.getElementById('signUpBtn').classList.add('bg-sky-600', 'text-white');
    document.getElementById('signUpBtn').classList.remove('bg-sky-50', 'text-sky-600');
    document.getElementById('signInBtn').classList.add('bg-sky-50', 'text-sky-600');
    document.getElementById('signInBtn').classList.remove('bg-sky-600', 'text-white');
}

function validateEmail(email) {
    return email.includes('@') && email.includes('.com');
}

document.getElementById('signUpForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;

    if (!validateEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }

    if (users.some(user => user.username === username)) {
        alert('Username already exists');
        return;
    }

    document.getElementById('signupText').classList.add('hidden');
    document.getElementById('signupSpinner').classList.remove('hidden');

    setTimeout(() => {
        users.push({ email, username, password });
        alert('Registration successful! Please sign in.');
        document.getElementById('signupText').classList.remove('hidden');
        document.getElementById('signupSpinner').classList.add('hidden');
        showSignIn();
        this.reset();
    }, 2000);
});

document.getElementById('signInForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    document.getElementById('loginText').classList.add('hidden');
    document.getElementById('loginSpinner').classList.remove('hidden');

    setTimeout(() => {
        const user = users.find(u => u.username === username);
        if (!user) {
            alert('User  not found');
        } else if (user.password !== password) {
            alert('Incorrect password');
        } else {
            alert('Login successful!');
            successLogin = 1;
            window.location.href = `index.html?username=${encodeURIComponent(username)}`;
        }
        document.getElementById('loginText').classList.remove('hidden');
        document.getElementById('loginSpinner').classList.add('hidden');
    }, 2000);
});