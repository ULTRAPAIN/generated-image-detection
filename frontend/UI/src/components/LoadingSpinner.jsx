import { motion } from "framer-motion";

const LoadingSpinner = () => {
	return (
		<div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-black">
			{/* Animated Falling Stars */}
			{[...Array(4)].map((_, i) => (
				<motion.div
					key={i}
					className="absolute inset-0"
					animate={{ y: [0, 650] }}
					transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: i * -1.5 }}
				>
					{[...Array(7)].map((_, j) => (
						<div
							key={j}
							className="absolute w-[3px] h-[3px] bg-white rounded-full opacity-70"
							style={{
								top: `${Math.random() * 100}px`,
								left: `${Math.random() * 100}%`,
							}}
						></div>
					))}
				</motion.div>
			))}

			{/* Astronaut Spinner */}
			<motion.div
				className="relative w-40 h-40"
				animate={{ rotate: 360 }}
				transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
			>
				{/* Backpack */}
				<div className="absolute top-[50%] left-[50%] w-24 h-28 bg-blue-300 rounded-t-[30px] -translate-x-1/2 -translate-y-1/2"></div>

				{/* Head */}
				<div className="absolute top-[15%] left-[50%] w-16 h-16 bg-gray-300 rounded-full border border-gray-400 shadow-md -translate-x-1/2"></div>
				<div className="absolute top-[18%] left-[50%] w-12 h-8 bg-blue-700 rounded-md -translate-x-1/2"></div>

				{/* Body */}
				<div className="absolute top-[35%] left-[50%] w-20 h-24 bg-gray-200 rounded-[20px] border border-gray-300 shadow-md -translate-x-1/2"></div>

				{/* Panel */}
				<div className="absolute top-[45%] left-[50%] w-16 h-10 bg-blue-500 rounded-md -translate-x-1/2"></div>

				{/* Arms */}
				<div className="absolute top-[50%] left-[20%] w-10 h-4 bg-gray-300 rounded-l-full"></div>
				<div className="absolute top-[50%] right-[20%] w-10 h-4 bg-gray-300 rounded-r-full"></div>

				{/* Legs */}
				<div className="absolute bottom-[5%] left-[40%] w-4 h-6 bg-gray-300 rounded-b-md"></div>
				<div className="absolute bottom-[5%] right-[40%] w-4 h-6 bg-gray-300 rounded-b-md"></div>
			</motion.div>
		</div>
	);
};

export default LoadingSpinner;
