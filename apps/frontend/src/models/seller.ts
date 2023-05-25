export interface ISeller {
	_id: string;
	name: string;
	surname: string;
	email: string;
	title: string;
	country: string;
	city: string;
	address: string;
	registerNumber: number;
	companyType: string;
	phone: string;
	website: string;
	targetedMarket: string;
	coordinates: number[];
	orders: any[];
	products: any[];
	maxDistance: number;
  	minPrice: number;
	deliveryCost: number;
}
