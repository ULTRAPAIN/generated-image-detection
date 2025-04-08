const Input = ({ icon: Icon, ...props }) => {
	return (
		<div className='relative mb-6'>
			<div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
				<Icon className='text-green-500 size-5' />
			</div>
			<input
				{...props}
				className='w-full py-2 pl-10 pr-3 text-white placeholder-gray-400 transition duration-200 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500'
			/>
		</div>
	);
};
export default Input;