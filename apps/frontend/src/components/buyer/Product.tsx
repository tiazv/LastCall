import {
	Alert,
	AlertTitle,
	Box,
	Button,
	Card,
	CardContent,
	Container,
	Divider,
	IconButton,
	List,
	ListItem,
	ListItemText,
	TextField,
	Typography,
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { IDrink } from 'models/drink';
import { MouseEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from 'services/api';
import NavbarB from './NavbarB';
import CustomBox from 'components/ui/CustomBox';
import { Link } from 'react-router-dom';
import { useUserAuth } from 'context/AuthContext';
import { useCartContext } from 'context/CartContext';
import { isProductInArray } from 'utils/isProductInArray';

function Product() {
	const [drink, setDrink] = useState<IDrink>();
	const [fetchError, setFetchError] = useState(false);
	const [quantity, setQuantity] = useState(1);
	const [showAlert, setShowAlert] = useState(false);
	const [showWarning, setShowWarning] = useState(false);
	const { id } = useParams<{ id: string }>();
	const { user, role } = useUserAuth();
	const { cartProducts, setCartProducts } = useCartContext();

	useEffect(() => {
		const fetchProductData = async () => {
			try {
				const response = await api.get('/products/' + id);
				setDrink(response.data);
			} catch (error) {
				setFetchError(true);
				throw error;
			}
		};
		fetchProductData();
	}, [id]);

	useEffect(() => {
		if (drink) {
			document.title = `Last Call | ${drink.title}`;
		}
	}, [drink]);

	if (fetchError) {
		return <>Product Not found</>;
	}

	if (!drink) {
		return null; // Render a loader or placeholder here
	}

	const addToCart = async (event: MouseEvent<HTMLElement>) => {
		event.preventDefault();
		if (!user || role !== 'buyer' || !user.emailVerified) {
			setShowWarning(true);
			return;
		}
		try {
			const response = await api.post(
				`/cart/add`,
				{
					email: user.email,
					cart: [
						{
							productId: id,
							quantity: quantity,
						},
					],
				},
				{
					headers: {
						Authorization: user?.stsTokenManager?.accessToken,
					},
				}
			);
			setShowAlert(true);
			if (!isProductInArray(cartProducts, id)) {
				setCartProducts([
					...cartProducts,
					{ product: drink, quantity: quantity },
				]);
			}
		} catch (error: any) {
			console.error(error);
			throw error;
		}
	};

	const handleCloseAlert = () => {
		setShowAlert(false);
	};

	return (
		<Box sx={{ backgroundColor: '#f2f2f2', minHeight: '100vh' }}>
			<NavbarB />
			<Container>
				{showAlert && (
					<Alert
						severity="success"
						style={{ marginTop: '1rem' }}
						action={
							<IconButton
								aria-label="close"
								color="inherit"
								size="small"
								onClick={handleCloseAlert}
							>
								<CloseOutlinedIcon fontSize="inherit" />
							</IconButton>
						}
					>
						<AlertTitle>Product added to cart</AlertTitle>
						Go to{' '}
						<Link to="/cart">
							<span className="blackLink">cart</span>
						</Link>{' '}
						to checkout.
					</Alert>
				)}
				{showWarning && (
					<Alert
						severity="error"
						style={{ marginTop: '1rem' }}
						action={
							<IconButton
								aria-label="close"
								color="inherit"
								size="small"
								onClick={() => {
									setShowWarning(false);
								}}
							>
								<CloseOutlinedIcon fontSize="inherit" />
							</IconButton>
						}
					>
						<AlertTitle>
							You must be logged in to add items to cart.
						</AlertTitle>
						Go to{' '}
						<Link to="/buy/signin">
							<span className="blackLink">sign in</span>
						</Link>
						.
					</Alert>
				)}
				<CustomBox>
					<Box sx={{ flex: '1.25' }}>
						<img
							src={drink?.picture}
							alt="heroImg"
							style={{ maxWidth: '100%', marginTop: '7rem' }}
						/>
					</Box>

					<Box
						sx={{
							flex: '1',
							marginTop: '7rem',
							minHeight: '52vh',
							marginBottom: '10rem',
						}}
					>
						<Card>
							<CardContent>
								<Typography
									variant="h4"
									component="span"
									gutterBottom
								>
									{drink?.title}
								</Typography>
								<Typography color="textSecondary" gutterBottom>
									Price: {drink?.price} €
								</Typography>
								<Divider />
								<br />
								<Typography
									variant="h6"
									component="span"
									sx={{ flex: '1' }}
								>
									Description:
									<List>
										<ListItem>
											<ListItemText
												primary={
													'Drink category: ' +
													drink?.drinkCategory
												}
											/>
										</ListItem>
										<ListItem>
											<ListItemText
												primary={'Size: ' + drink?.size}
											/>
										</ListItem>
										<ListItem>
											<ListItemText
												primary={
													'Packaging: ' +
													drink?.packaging
												}
											/>
										</ListItem>
									</List>
								</Typography>
								<Divider />
								<br />

								<Alert severity="success">
									There is currently a 25% discount for this
									item!{' '}
								</Alert>
								<br />
								<Divider />
								<br />
								<Typography
									variant="h6"
									component="span"
									sx={{ flex: '1' }}
								>
									Add this product to basket:
									<Box
										display="flex"
										alignItems="center"
										gap={10}
									>
										<Box flex="1">
											<TextField
												value={quantity}
												onChange={(e) =>
													setQuantity(
														Number(e.target.value)
													)
												}
												label="Quantity"
												placeholder="1"
												type="number"
												fullWidth
												inputProps={{
													min: 1,
												}}
											/>
										</Box>
										<Box>
											<Button onClick={addToCart}>
												Add to basket
											</Button>
										</Box>
									</Box>
									<p style={{ fontSize: '15px' }}>
										In stock: {drink?.stock}
									</p>
								</Typography>
							</CardContent>
						</Card>
					</Box>
				</CustomBox>
			</Container>
		</Box>
	);
}

export default Product;
