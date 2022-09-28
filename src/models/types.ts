export interface PaginatedItems<Item> {
	items: Array<Item>;
	curPage?: string;
	nextPage?: string;
}
