export interface PaginatedItems<Item> {
	items: Array<Item>;
	prevPage?: string;
	nextPage?: string;
}
