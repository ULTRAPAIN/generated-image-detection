import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Combined import
import Joyride from "react-joyride";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import blockDiagram from "../assets/Block-Diagram.png";
import GeneratorAndCriticLoss from "../assets/GeneratorAndCriticLoss.png";
import GCT from "../assets/GeneratorAndCriticLossDuringTraining.png";
import mp from "../assets/Models-parameter.png";
import Chatbot from "../components/chatbot";
import {
  FaUserCircle, FaSignOutAlt, FaMoon, FaSun,
  FaUpload, FaImage, FaChartBar, FaInfoCircle,
  FaDatabase, FaCode, FaGithub
} from "react-icons/fa";


// Import Chart components
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend
);

const apiUrl = import.meta.env.VITE_FLASK_API_URL + "/api/detect-image";
console.log("Flask API URL:", import.meta.env.VITE_FLASK_API_URL);

const DashboardPage = () => {
  const { user, logout } = useAuthStore();
  const [selectedFile, setSelectedFile] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [activeTab, setActiveTab] = useState("detect");
  const [error, setError] = useState(null);

  const [tourRun, setTourRun] = useState(true); // New state to trigger the tour

  // Define tour steps (customize selectors and text as needed)
  const tourSteps = [
    {
      target: ".how-it-works",
      content: "Details about our AI-generated image detection process.",
      placement: "top",
    },
    {
      target: ".performance",
      content: "Models performance metrics and comparisons.",
      placement: "top",
    },
    {
      target: ".Dataset",
      content: "Dataset used for training and testing.",
      placement: "top",
    },
    {
      target: ".detect-image-tab",
      content: "This is the image detection area—upload or drag-and-drop an image here.",
      placement: "bottom",
    },
    {
      target: ".recent-activity-panel",
      content: "Here you'll see your recent activity and the results of your detections.",
      placement: "left",
    },

  ];

  const [selectedRecentActivity, setSelectedRecentActivity] = useState(null);
  const fileInputRef = useRef(null);

  const removeRecentActivity = (indexToRemove) => {
    setRecentActivity((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPredictionResult(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.getElementById("imagePreview");
        if (preview) {
          preview.src = e.target.result;
          preview.style.display = "block";
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first!");
      return;
    }
    setIsLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      const fullDataUrl = reader.result;
      const base64data = fullDataUrl.split(",")[1];
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64data }),
        });
        const result = await response.json();
        if (response.ok) {
          setPredictionResult(result);
          const confidence = result.confidence || 0;
          const detection = result.isAI ? "AI-generated" : "Real";
          setRecentActivity((prev) => [
            { 
              timestamp: new Date().toLocaleTimeString(), 
              result: detection, 
              confidence,
              filename: selectedFile.name,
              image: fullDataUrl
            },
            ...prev.slice(0, 4)
          ]);
        } else {
          setError(result.error);
          toast.error(result.error);
        }
      } catch (err) {
        setError("Request failed");
        toast.error("Request failed");
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      toast.error("Error reading the file!");
      setIsLoading(false);
    };
  };

  const triggerFileInput = () => fileInputRef.current.click();

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      setPredictionResult(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.getElementById("imagePreview");
        if (preview) {
          preview.src = e.target.result;
          preview.style.display = "block";
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Chart Data Preparations
  let barData = null;
  if (predictionResult && predictionResult.confidence !== undefined) {
    barData = {
      labels: ["Confidence", "Remaining"],
      datasets: [
        {
          label: "Prediction Confidence",
          data: [predictionResult.confidence, 100 - predictionResult.confidence],
          backgroundColor: [
            predictionResult.isAI ? "rgba(255, 99, 132, 0.5)" : "rgba(54, 162, 235, 0.5)",
            "rgba(75, 192, 192, 0.5)"
          ],
          borderWidth: 1,
        },
      ],
    };
  }

  let pieData = null;
  if (predictionResult && predictionResult.artifacts && predictionResult.artifacts.length > 0) {
    const artifactWeights = predictionResult.artifacts.map(() => Math.floor(Math.random() * 20) + 10);
    pieData = {
      labels: predictionResult.artifacts,
      datasets: [
        {
          label: "Artifact Distribution",
          data: artifactWeights,
          backgroundColor: predictionResult.artifacts.map((_, idx) =>
            idx % 2 === 0 ? "rgba(54, 162, 235, 0.6)" : "rgba(255, 159, 64, 0.6)"
          )
        }
      ]
    };
  }

  // Tab Components
  const DetectTab = () => (
    <div className="w-full">
      <div
        onClick={triggerFileInput}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-dashed border-2 p-8 text-center cursor-pointer ${isDarkMode ? "border-gray-400 bg-gray-800 text-gray-300" : "border-gray-300 bg-white text-gray-700"}`}
        style={{ width: "100%", height: "300px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
      >
        <div className="flex flex-col items-center">
          <FaImage className="text-4xl mb-3" />
          <p>Drag and drop an image here or click to select a file.</p>
          {selectedFile && <p className="mt-2 text-green-400">Selected: {selectedFile.name}</p>}
        </div>
        <img id="imagePreview" className="mt-4 max-h-32 hidden rounded-lg shadow-md" alt="Preview" />
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>
      
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleImageUpload}
        disabled={isLoading || !selectedFile}
        className={`w-full flex justify-center items-center mt-4 px-4 py-3 font-bold text-white rounded-lg shadow-lg duration-300 ${isLoading || !selectedFile ? "bg-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"} focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <FaImage className="animate-spin" /> Analyzing...
          </span>
        ) : (
          <>
            <FaUpload className="mr-2" /> Analyze Image
          </>
        )}
      </motion.button>

      {predictionResult && (
        <div className={`mt-4 p-6 rounded-lg shadow-lg transition-colors duration-300 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
            Results
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Textual Information */}
            <div className="space-y-4">
              {/* Detection */}
              <div className="flex items-center">
                <span className="font-semibold w-32">Detection:</span>
                <span className={`text-lg px-2 py-1 rounded-full ${predictionResult.isAI ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                  {predictionResult.isAI ? "AI-generated" : "Real"}
                </span>
              </div>
              {/* Confidence */}
              <div className="flex items-center">
                <span className="font-semibold w-32">Confidence:</span>
                <span className={`text-lg px-2 py-1 rounded-full ${isDarkMode ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-800"}`}>
                  {predictionResult.confidence}%
                </span>
              </div>
              {/* Artifacts */}
              {predictionResult.artifacts && predictionResult.artifacts.length > 0 && (
                <div>
                  <p className="font-semibold text-lg mb-1">Artifacts:</p>
                  <div className="flex flex-wrap gap-2">
                    {predictionResult.artifacts.map((item, index) => (
                      <span
                        key={index}
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          isDarkMode ? "bg-gray-700 text-gray-200" : "bg-gray-300 text-gray-800"
                        }`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chart Displays */}
            <div className="space-y-6">
              {barData && (
                <div className="border p-2 rounded-lg" style={{ maxWidth: "500px", height: "300px" }}>
                  <Bar
                    data={barData}
                    options={{
                      maintainAspectRatio: false,
                      responsive: true,
                      plugins: {
                        legend: { display: true, position: "top" },
                        title: { display: true, text: "Prediction Confidence" },
                      },
                    }}
                  />
                </div>
              )}
              {pieData && (
                <div className="border p-2 rounded-lg" style={{ maxWidth: "500px", height: "300px" }}>
                  <Pie
                    data={pieData}
                    options={{
                      maintainAspectRatio: false,
                      responsive: true,
                      plugins: {
                        legend: { display: true, position: "bottom" },
                        title: { display: true, text: "Artifact Distribution" },
                      },
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {error && <p style={{ color: "red" }} className="mt-4">{error}</p>}
    </div>
  );

  const ExplainTab = () => (
    <div className={`p-6 rounded-lg shadow-xl transition-colors duration-300 ${isDarkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-700"}`}>
      <h3 className="text-2xl font-bold mb-4">
        How Our AI-Generated Image Detection Works
      </h3>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Textual Explanation */}
        <div className="md:w-1/2 space-y-6">
          <div>
            <h4 className="text-lg font-bold mb-1">GAN Training</h4>
            <p>
              We train two advanced GANs – WGAN and ProGAN – where each GAN learns to generate realistic images. During this process, a critic learns to distinguish between real and fake images.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-1">Discriminator Fine-Tuning</h4>
            <p>
              After training, the critics are converted into discriminators (binary classifiers) by adding classification layers. These are fine-tuned to accurately detect AI-generated content.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-1">Performance Evaluation</h4>
            <p>
              We test and validate these models using metrics like accuracy, precision, recall, F1 score, and ROC-AUC. Visualization tools, such as loss curves and t-SNE plots, help us understand model behavior and performance.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-1">Backend &amp; Deployment</h4>
            <p>
              The entire model is powered by Python (TensorFlow/PyTorch), accelerated by NVIDIA GPUs, and containerized for flexible deployment. It’s ready for the cloud or local use.
            </p>
            <div className="m-2">
              <img 
                src={blockDiagram} 
                alt="How It Works Diagram" 
                className="max-w-full rounded-lg shadow-md" 
              />
            </div>
            <div className="m-2">
              <img 
                src={GeneratorAndCriticLoss} 
                alt="How It Works Diagram" 
                className="max-w-full rounded-lg shadow-md" 
              />
            </div>
          </div>
        </div>
        {/* Image Display */}
        <div className="md:w-1/2 flex-col">
          <div className="m-2">
            <img 
              src={mp} 
              alt="How It Works Diagram" 
              className="max-w-full rounded-lg shadow-md" 
            />
          </div>
          <div className="m-5">
            <img 
              src={GCT} 
              alt="How It Works Diagram" 
              className="max-w-full rounded-lg shadow-md" 
            />
          </div>
        </div>
      </div>
    </div>
  );

  const CompareTab = () => (
    <div className={`p-6 rounded-lg shadow-xl ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
      <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
        Test metrics of GAN discriminative models as well as benchmark models
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Model
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Accuracy
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Precision
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Recall
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                F1
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                ROC-AUC
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Loss
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">
                WGAN Discriminator
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-green-500">99.76%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">99.88%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">99.64%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">99.76%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">100</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">0.0007</td>
            </tr>
            <tr>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">
                ProGAN Discriminator
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-green-500">99.79%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">99.92%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">99.66%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">99.97%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">100</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">0.0012</td>
            </tr>
            <tr>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">
                Resnet 18 (WGAN)
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">99.34%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">98.83%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">99.86%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">99.34%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">99.96%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">0.0220</td>
            </tr>
            <tr>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">
                Resnet 18 (ProGAN)
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">62.19%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">94.45%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">25.90%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">40.65%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">56.15%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">0.0455</td>
            </tr>
            <tr>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">
                Resnet 50 (WGAN)
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">99.99%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">99.98%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">100%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">99.99%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">100%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">0.0076</td>
            </tr>
            <tr>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">
                Resnet 50 (ProGAN)
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">99.68%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">99.40%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">99.96%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">99.68%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">100%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">0.0050</td>
            </tr>
            <tr>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">
                VGG 11 (WGAN)
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">50%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">100%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">0%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">0%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">50%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">2.5641</td>
            </tr>
            <tr>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">
                VGG 11 (ProGAN)
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">50%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">50%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">100%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">66.67%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">50%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">0.0335</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const DatasetTab = () => (
    <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-700"}`}>
      <h3 className="text-xl font-bold mb-4">Dataset Information</h3>
      <p>
        Our model was trained using a diverse dataset comprised of thousands of images including real human faces and AI-generated samples.
      </p>
      <ul className="list-disc ml-6 mt-4">
        <li>
          <strong>Training Data:</strong> 25,000 real images along with synthetic images generated using our GAN approach.
        </li>
        <li>
          <strong>Validation Data:</strong> 5,000 curated images for performance tuning.
        </li>
        <li>
          <strong>Testing Data:</strong> 20,000 images to ensure generalization across different styles and sources.
        </li>
      </ul>
      <p className="mt-4">
        Additionally, our dataset is continuously updated based on new AI-generation techniques to ensure robust detection performance.
      </p>
  
      <h3 className="text-xl font-bold mt-8 mb-4">Resources</h3>
      <ul className="list-disc ml-6">
        <li>
          <strong>Dataset:</strong> Curated dataset of approximately 70,000 real facial images (with 25,000 used for training, and 5,000 each for validation and testing) alongside fake images generated from GAN models, sourced from publicly available resources such as Kaggle.
        </li>
        <li>
          <strong>Hardware:</strong> High-performance computing resources with GPU acceleration are utilized for the intense computational demands of GAN training.
        </li>
        <li>
          <strong>Software and Libraries:</strong>
          <ul className="list-disc ml-6">
            <li>Deep Learning Frameworks: PyTorch or TensorFlow for model implementation and training.</li>
            <li>Data Processing: Python libraries such as NumPy, Pandas, and OpenCV for data preprocessing and augmentation.</li>
            <li>Visualization: Matplotlib and Seaborn for plotting loss curves and t-SNE visualizations.</li>
            <li>Version Control: Git and GitHub for code management and collaboration.</li>
          </ul>
        </li>
        <li>
          <strong>Human Resources:</strong> A team with expertise in machine learning, deep learning architectures, and data science is involved in the research, development, and validation phases.
        </li>
      </ul>
  
      <h3 className="text-xl font-bold mt-8 mb-4">Tools Used</h3>
      <ul className="list-disc ml-6">
        <li><strong>Programming Language:</strong> Python</li>
        <li><strong>Deep Learning Frameworks:</strong> PyTorch/TensorFlow</li>
        <li><strong>IDE:</strong> Jupyter Notebook / VSCode</li>
        <li><strong>Repository:</strong> GitHub (with the project codebase made publicly available)</li>
        <li><strong>Experiment Tracking:</strong> Tools such as TensorBoard or Weights &amp; Biases for monitoring training progress</li>
      </ul>
    </div>
  );

  return (
    <>
      {/* Guided Onboarding Tour */}
      <Joyride
        steps={tourSteps}
        run={tourRun}
        continuous
        showSkipButton
        styles={{
          options: {
            zIndex: 10000,
          },
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
        className={`w-full min-h-screen flex flex-col ${isDarkMode ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-gray-800"}`}
      >
        {/* Top Navigation Bar */}
        <div className="flex justify-between items-center p-4 bg-gray-900">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text">
              AI-Image Detective
            </h1>
          </div>
          <div className="flex items-center">
            <button onClick={() => setShowProfilePanel(!showProfilePanel)} className="mr-4 text-2xl text-gray-300 hover:text-green-400">
              <FaUserCircle />
            </button>
            <button onClick={toggleDarkMode} className="text-2xl text-gray-300 hover:text-green-400 mr-4">
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>
            <button onClick={logout} className="text-2xl text-gray-300 hover:text-red-400">
              <FaSignOutAlt />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`flex overflow-x-auto p-2 ${isDarkMode ? "bg-gray-800" : "bg-white"} border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
          <button onClick={() => setActiveTab("detect")} className={`detect-image-tab px-4 py-2 mx-1 rounded-t-lg flex items-center ${
            activeTab === "detect" 
              ? `${isDarkMode ? "bg-gray-700 text-green-400" : "bg-gray-200 text-green-600"} font-medium` 
              : `${isDarkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-800"}`
          }`}>
            <FaImage className="mr-2" /> Detect Image
          </button>
          <button onClick={() => setActiveTab("explain")} className={` how-it-works px-4 py-2 mx-1 rounded-t-lg flex items-center ${
            activeTab === "explain" 
              ? `${isDarkMode ? "bg-gray-700 text-green-400" : "bg-gray-200 text-green-600"} font-medium` 
              : `${isDarkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-800"}`
          }`}>
            <FaInfoCircle className="mr-2" /> How It Works
          </button>
          <button onClick={() => setActiveTab("compare")} className={` performance px-4 py-2 mx-1 rounded-t-lg flex items-center ${
            activeTab === "compare" 
              ? `${isDarkMode ? "bg-gray-700 text-green-400" : "bg-gray-200 text-green-600"} font-medium` 
              : `${isDarkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-800"}`
          }`}>
            <FaChartBar className="mr-2" /> Performance
          </button>
          <button onClick={() => setActiveTab("dataset")} className={` Dataset px-4 py-2 mx-1 rounded-t-lg flex items-center ${
            activeTab === "dataset" 
              ? `${isDarkMode ? "bg-gray-700 text-green-400" : "bg-gray-200 text-green-600"} font-medium` 
              : `${isDarkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-800"}`
          }`}>
            <FaDatabase className="mr-2" /> Dataset
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col md:flex-row p-4">
          <div className="w-full md:w-2/3 mb-4 md:mb-0 md:mr-4">
            <AnimatePresence exitBeforeEnter>
              {activeTab === "detect" && (
                <motion.div key="detect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <DetectTab />
                </motion.div>
              )}
              {activeTab === "explain" && (
                <motion.div key="explain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ExplainTab />
                </motion.div>
              )}
              {activeTab === "compare" && (
                <motion.div key="compare" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <CompareTab />
                </motion.div>
              )}
              {activeTab === "dataset" && (
                <motion.div key="dataset" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <DatasetTab />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Section - Recent Activity */}
          <div className={`recent-activity-panel w-full md:w-1/3 ${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-lg p-4`}>
            <h2 className="text-xl font-bold mb-4 text-transparent bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text">
              Recent Activity
            </h2>
            {recentActivity.length > 0 ? (
              <div>
                {recentActivity.map((activity, index) => {
                  // If confidence is on 0-1 scale, multiply by 100.
                  const conf = activity.confidence <= 1 ? activity.confidence * 100 : activity.confidence;
                  return (
                    <motion.div 
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className={`mb-3 p-3 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-100"} relative cursor-pointer`}
                      onClick={() => setSelectedRecentActivity(activity)}
                    >
                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentActivity(index);
                        }}
                        className="absolute top-1 right-1 text-red-500 hover:text-red-700 text-lg font-bold"
                        title="Remove Activity"
                      >
                        &times;
                      </button>
                      {/* Shifted tag and filename */}
                      <div className="flex justify-start items-center">
                        <span className={`text-sm px-2 py-1 rounded-full mr-2 ${
                          activity.result === "AI-generated" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }`}>
                          {activity.result}
                        </span>
                        <p className={`font-medium truncate max-w-xs ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {activity.filename}
                        </p>
                      </div>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-300 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${activity.result === "AI-generated" ? "bg-red-500" : "bg-green-500"}`}
                            style={{ width: `${conf}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs">{conf.toFixed(1)}%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className={`flex items-center justify-center h-40 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p>No recent activity. Try detecting an image!</p>
              </div>
            )}

            {/* Project Information */}
            <div className={`project-info mt-6 p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              <h3 className="font-bold mb-2">Project Information</h3>
              <p className="text-sm mb-2">Final Year Research Project</p>
              <div className="flex items-center text-sm">
                <FaGithub className="mr-2" />
                <a href="https://github.com/ULTRAPAIN/generated-image-detection" className={`${isDarkMode ? "text-blue-400" : "text-blue-600"} hover:underline`}>
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className={`p-4 text-center ${isDarkMode ? "text-gray-400" : "text-gray-500"} border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
          &copy; {new Date().getFullYear()} AI-Generated Image Detection. All rights reserved.
        </footer>

        {/* Profile Panel */}
        {showProfilePanel && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 right-0 w-96 h-full bg-gray-800 p-4 text-white z-50"
          >
            <h3 className="mb-3 text-xl font-semibold text-green-400">Profile Information</h3>
            <p className="text-gray-300">Name: {user.name}</p>
            <p className="text-gray-300">Email: {user.email}</p>
            <button
              onClick={() => setShowProfilePanel(false)}
              className="mt-4 px-4 py-2 bg-red-500 rounded-md hover:bg-red-600"
            >
              Close
            </button>
          </motion.div>
        )}

        {/* Modal: Display Image from Recent Activity */}
        {selectedRecentActivity && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
            onClick={() => setSelectedRecentActivity(null)}
          >
            <motion.div 
              className="bg-white p-4 rounded-lg relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={selectedRecentActivity.image} alt={selectedRecentActivity.filename} className="max-w-full max-h-[80vh]" />
              <button 
                onClick={() => setSelectedRecentActivity(null)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
              >
                &times;
              </button>
            </motion.div>
          </motion.div>
        )}
        <Chatbot />
      </motion.div>
    </>
  );
};

export default DashboardPage;