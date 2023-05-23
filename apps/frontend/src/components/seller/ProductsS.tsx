import {
	Alert,
	Box,
	Button,
	Container,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Modal,
	Select,
	TextField,
	Typography,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Drink from './DrinkS';
import { useState, useEffect } from 'react';
import api from 'services/api';
import { IDrink } from 'models/drink';
import PropertiesTextBox from 'components/ui/PropertiesTextBox';
import DrinkContainer from 'components/ui/DrinkContainer';
import PropertiesBox from 'components/ui/PropertiesBox';
import { style } from 'assets/styles/styles';
import { MuiFileInput } from 'mui-file-input';
import { storage } from '../../firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { v4 } from 'uuid';

const initialState = {
	title: '',
	drinkCategory: '',
	packaging: '',
	size: '',
	price: 0,
	stock: 0,
	seller: '646d00794b90a5f825353375',
	image: '',
};

interface Product {
	title: string;
	drinkCategory: string;
	packaging: string;
	size: string;
	price: number;
	stock: number;
	seller: string;
	image: string;
}

const requiredFields: (keyof Product)[] = [
	'title',
	'drinkCategory',
	'packaging',
	'size',
	'price',
	'stock',
];

const ProductsS = () => {
	const [newProduct, setNewProduct] = useState(initialState);
	const [drinks, setDrinks] = useState<IDrink[]>([]);
	const [isOpenAdd, setIsOpenAdd] = useState(false);
	const [error, setError] = useState('');
	const [productImage, setProductImage] = useState<File | null>(null);

	const handleFormSubmit = async (imageURL: string) => {
		setError('');
		for (const field of requiredFields) {
			if (!newProduct[field]) {
				setError(
					`${
						field.charAt(0).toUpperCase() + field.slice(1)
					} is required`
				);
				return;
			}
		}
		try {
			const updatedProduct = { ...newProduct, picture: imageURL };
			console.log(updatedProduct);
			const response = await api.post('/products', updatedProduct);
			console.log(response.data);
			setNewProduct(initialState);
			setDrinks((prev: any) => [...prev, response.data]);
			setIsOpenAdd(false);
			setProductImage(null);
		} catch (error) {
			setError('Error adding product');
			console.error(error);
		}
	};

	const handleInputChange = (event: any) => {
		event.preventDefault();
		const { name, value } = event.target;
		setNewProduct((prevnewProduct) => ({
			...prevnewProduct,
			[name]: value,
		}));
	};

	useEffect(() => {
		const fetchSellerProducts = async () => {
			try {
				const response = await api.get('/products');
				//console.log(response.data);
				setDrinks(response.data);
			} catch (error) {
				throw error;
			}
		};
		fetchSellerProducts();
	}, []);

	const handleChange = (newFile: any) => {
		//console.log(newFile);
		if (newFile) {
			if (newFile.type.startsWith('image/')) {
				// The uploaded file is an image
				setError('');
				//console.log(newFile.type);
				setProductImage(newFile);
			} else {
				// The uploaded file is not an image
				setError('File is not an image');
				console.log(newFile.type);
			}
		} else {
			setError('No file uploaded');
		}
	};

	const uploadImage = async () => {
		if (!productImage) {
			setError('Image is required');
			return;
		}
		const storageRef = ref(storage, `images/${productImage.name + v4()}`);
		try {
			const uploadTask = uploadBytes(storageRef, productImage);
			const response = await uploadTask;
			const downloadURL = await getDownloadURL(response.ref);
			setNewProduct((prevNewProduct) => {
				const updatedProduct = {
					...prevNewProduct,
					image: downloadURL,
				};
				handleFormSubmit(downloadURL); // Call handleFormSubmit immediately after the state update
				return updatedProduct;
			});
		} catch (error: any) {
			setError(error);
		}
	};

	//console.log(drinks);

	return (
		<Box sx={{ backgroundColor: '#f2f2f2', py: 10 }}>
			<Container>
				<PropertiesTextBox>
					<Typography
						sx={{
							color: '#000339',
							fontSize: '35px',
							fontWeight: 'bold',
						}}
					>
						My products
						<IconButton onClick={() => setIsOpenAdd(!isOpenAdd)}>
							<AddCircleOutlineIcon />
						</IconButton>
						<Modal
							open={isOpenAdd}
							onClose={() => setIsOpenAdd(false)}
							aria-labelledby="modal-modal-title"
							aria-describedby="modal-modal-description"
						>
							<Box component="form" sx={style}>
								<Typography
									id="modal-modal-title"
									variant="h6"
									component="h2"
								>
									Add product
								</Typography>
								<br />
								<TextField
									label="Title"
									placeholder="Enter title"
									type="text"
									fullWidth
									required
									name="title"
									value={newProduct.title}
									onChange={handleInputChange}
									sx={{ mb: 2 }}
								/>
								<FormControl fullWidth required sx={{ mb: 2 }}>
									<InputLabel
										id="drink-category-select"
										shrink
									>
										Drink category
									</InputLabel>
									<Select
										labelId="drink-category-select"
										id="drink-category-select"
										name="drinkCategory"
										value={newProduct.drinkCategory}
										onChange={handleInputChange}
									>
										<MenuItem value="">
											Select drink category
										</MenuItem>
										<MenuItem value="Beer">Beer</MenuItem>
										<MenuItem value="Wine">Wine</MenuItem>
										<MenuItem value="Champagne">
											Champagne
										</MenuItem>
										<MenuItem value="Other">Other</MenuItem>
									</Select>
								</FormControl>
								<TextField
									label="Packaging"
									placeholder="Enter packaging"
									type="text"
									fullWidth
									required
									name="packaging"
									value={newProduct.packaging}
									onChange={handleInputChange}
									sx={{ mb: 2 }}
								/>
								<TextField
									label="Size"
									placeholder="Enter size"
									type="text"
									fullWidth
									required
									name="size"
									value={newProduct.size}
									onChange={handleInputChange}
									sx={{ mb: 2 }}
								/>
								<TextField
									label="Price"
									placeholder="Enter price"
									type="number"
									fullWidth
									required
									name="price"
									value={newProduct.price}
									onChange={handleInputChange}
									sx={{ mb: 2 }}
								/>
								<TextField
									label="Stock"
									placeholder="Enter stock"
									type="number"
									fullWidth
									required
									name="stock"
									value={newProduct.stock}
									onChange={handleInputChange}
									sx={{ mb: 2 }}
								/>
								<MuiFileInput
									value={productImage}
									onChange={handleChange}
									style={{ cursor: 'pointer' }}
								/>
								<br />
								<br />
								{error && (
									<Alert severity="error">
										<b>{error}</b>
									</Alert>
								)}
								<Typography sx={{ mt: 2 }}>
									<Button
										color="primary"
										variant="contained"
										fullWidth
										onClick={uploadImage}
									>
										Add
									</Button>
								</Typography>
							</Box>
						</Modal>
					</Typography>
					<Typography
						sx={{ color: '#5A6473', fontSize: '16px', mt: 1 }}
					>
						All the items in my inventory.
					</Typography>
				</PropertiesTextBox>
				<PropertiesBox>
					{drinks &&
						drinks.map((drink: IDrink) => (
							<DrinkContainer key={drink._id}>
								<Drink
									drink={drink}
									setDrinks={setDrinks}
									drinks={drinks}
								/>
							</DrinkContainer>
						))}
				</PropertiesBox>
			</Container>
		</Box>
	);
};

export default ProductsS;
