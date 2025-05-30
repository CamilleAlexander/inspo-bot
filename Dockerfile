# 🧱 Base: Use official Node.js 20 image (slim = lighter + faster)
FROM node:20-slim

# 📂 Set working directory inside the container
WORKDIR /usr/src/app

# 📦 Copy dependency files first (for better Docker cache use)
COPY package*.json ./

# 📥 Install production dependencies only
RUN npm install --omit=dev

# 📁 Copy the rest of your app into the container
COPY . .

# 🔊 Set and expose port 8080 for Cloud Run
ENV PORT=8080
EXPOSE 8080

# 🚀 Launch the bot!
CMD ["npm", "start"]
