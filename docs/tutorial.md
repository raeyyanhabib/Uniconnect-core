# 🛠 The UniConnect Setup & Push Tutorial

So, you've got the code and you're ready to get to work. Don't sweat it if you feel lost—this tutorial will show you exactly how to set up UniConnect in Visual Studio Code and how to start pushing your updates without bringing down the whole server.

---

## 1. Setting Up the Environment in VS Code

We kept this easy. Follow these steps sequentially:

### **Step A: Clone and Open**
1. Open Visual Studio Code.
2. Hit `Ctrl + Shift + \`` (or go to **Terminal > New Terminal** from the top menu).
3. Clone the repo if you haven't already:
   ```bash
   git clone <your-repo-link>
   ```
4. In VS Code, go to **File > Open Folder**, and select the `sda-uniconnect` folder.

### **Step B: Install Dependencies**
We have dual environments going on here (Frontend and Backend), so we gotta install packages for both.
1. In your VS Code terminal, make sure you're in the root `sda-uniconnect` folder and run:
   ```bash
   npm install
   ```
2. Next, CD into the server and do the same thing:
   ```bash
   cd server
   npm install
   cd ..
   ```

### **Step C: Fire It Up**
To see the app in your browser, you need to turn on both the server and the frontend.
1. **Start the Frontend:** Open a terminal in the root `sda-uniconnect` folder and run:
   ```bash
   npm run dev
   ```
2. **Start the Backend:** Open a *second* terminal window in VS Code (click the `+` icon in the terminal panel), navigate to the server folder, and run:
   ```bash
   cd server
   npm start
   ```

Boom. You should now be able to visit `http://localhost:5173/` in your browser.

---

## 2. Making Changes and Pushing Code (Git)

Okay, you wrote some fire code and are ready to save it to GitHub. Here is the ritual:

### **Stage Your Changes**
You have to tell Git *which* files you want to include in this update.
```bash
git add .
```
*(The `.` means "add absolutely everything that I changed." If you only want to add a specific file, you can do `git add src/App.tsx`.)*

### **Commit Your Changes**
Now you lock those changes in with a message describing what you did. Be descriptive so your team knows what’s going on!
```bash
git commit -m "various fixes: did the notif bar and message bar smth"
```

### **Push to GitHub**
To actually send it up to the remote repository so the rest of the team gets it:
```bash
git push
```

*(Note: Always run `git pull` before starting new work so you don't overwrite somebody else's progress!)*

---

You are officially ready. Go build something awesome.
