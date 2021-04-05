import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { Pagination, Search, TableHeader } from "../components/DataTable";
import useFullPageLoader from "../hooks/useFullPageLoader";

const DataTable = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [loader, showLoader, hideLoader] = useFullPageLoader();
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [sorting, setSorting] = useState({ field: "", order: "" });
    const [searchByStocks, setSearchByStocks] = useState("");
    const [view, setView] = useState("table");

    const ITEMS_PER_PAGE = 30;

    // Only applicable for the Table data.
    const headers = [
        { name: "Date", field: "date", sortable: false },
        { name: "Open", field: "open", sortable: true },
        { name: "High", field: "high", sortable: true },
        { name: "Low", field: "low", sortable: true },
        { name: "Close", field: "close", sortable: true },
        { name: "AdjClose", field: "adjClose", sortable: true },
        { name: "Volume", field: "volume", sortable: true },
    ];

    // setView either Table or Card
    const selectText = (e) => {
        setView(e);
    }
    const filterBy = () => true;

    const handleSearch = (query) => {
        setIsLoading(true);
        fetch(`http://localhost:3005/stockname?search=${query}`)
            .then((resp) => resp.json())
            .then(({ data }) => {
                const options = data.map((i) => ({
                    id: i.id,
                    name: i.name,
                }));
                setOptions(options);
                setIsLoading(false);
            });
    };

    useEffect(() => {
        const getData = () => {
            showLoader();
            const searchUserURL = `http://localhost:3005/stock/fetch?search=${searchByStocks}`;
            axios.get(searchUserURL)
                .then(json => {
                    let fetchedData = json.data.data;
                    if (fetchedData == "no data found") {
                        hideLoader();
                        setStocks([]);
                        setTotalItems(0);
                    } else {
                        hideLoader();
                        setStocks(fetchedData);
                    }
                });
        };
        getData();
    }, [searchByStocks]);

    const commentsData = useMemo(() => {
        let computedStocks = stocks;
        if (search) {
            computedStocks = computedStocks.filter(
                stocksVal =>
                    stocksVal.date.toLowerCase().includes(search.toLowerCase()) ||
                    stocksVal.low.toLowerCase().includes(search.toLowerCase()) ||
                    stocksVal.open.toLowerCase().includes(search.toLowerCase()) ||
                    stocksVal.close.toLowerCase().includes(search.toLowerCase()) ||
                    stocksVal.volume.toLowerCase().includes(search.toLowerCase()) ||
                    stocksVal.adjClose.toLowerCase().includes(search.toLowerCase())
            );
        }

        setTotalItems(computedStocks.length);

        //Sorting comments
        if (sorting.field) {
            const reversed = sorting.order === "asc" ? 1 : -1;
            computedStocks = computedStocks.sort(
                (a, b) =>
                    reversed * a[sorting.field].localeCompare(b[sorting.field])
            );
        }

        //Current Page slice
        return computedStocks.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            (currentPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE
        );
    }, [stocks, totalItems, currentPage, search, sorting]);

    const blurItem = (e) => {
        setSearchByStocks(e.length > 0 ? e[0].name : "");
    }

    // Create card and prepared some data for it.
    const UserCard = ({ sno, data }) => {
        return (
            <li className="list-group-item">
                <div className="card border-0">
                    <div className="row no-ggit stutters">
                        <div className="col-md-3">
                            {searchByStocks}
                        </div>
                        <div className="col-md-9">
                            <div className="card-body py-1 px-2 text-left">
                                <p className="card-text">Date {data.date !== "null" ? data.date : "-"}</p>
                                <p className="card-text">Open {data.open !== "null" ? data.open : "-"}</p>
                                <p className="card-text">High {data.high !== "null" ? data.high : "-"}</p>
                                <p className="card-text">Low {data.low !== "null" ? data.low : "-"}</p>
                                <p className="card-text">Close {data.close !== "null" ? data.close : "-"}</p>
                                <p className="card-text">AdjClose {data.adjClose !== "null" ? data.adjClose : "-"}</p>
                                <p className="card-text">Volume {data.volume !== "null" ? data.volume : "-"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        );
    };

    return (
        <>
            <div>
                <h3 className="header">Finance Historical data</h3>
                <DropdownButton onSelect={selectText} id="dropdown-basic-button" title="Select View" >
                    <Dropdown.Item eventKey="Card" href="#/action-1" title="Card">Card</Dropdown.Item>
                    <Dropdown.Item eventKey="table" href="#/action-2" title="table">Table</Dropdown.Item>
                </DropdownButton>
            </div>
            <div className="row">
                <div className="col text-center">
                    <div className="typeahead">
                        <AsyncTypeahead
                            onChange={blurItem}
                            filterBy={filterBy}
                            isLoading={isLoading}
                            labelKey="name"
                            defaultInputValue={searchByStocks}
                            minLength={1}
                            onSearch={handleSearch}
                            options={options}
                            placeholder="Quote lookup.."
                            renderMenuItemChildren={(option, props) => (
                                <>
                                    <span>{option ? option.name : ""}</span>
                                </>
                            )}
                        />
                    </div>
                </div>
            </div>

            <div className="row w-100">
                <div className="col mb-3 col-12 text-center">
                    <div className="row">
                        <div className="col-md-6">
                            <Pagination
                                dataCount={stocks.length}
                                total={totalItems}
                                itemsPerPage={ITEMS_PER_PAGE}
                                currentPage={currentPage}
                                onPageChange={page => setCurrentPage(page)}
                            />
                        </div>
                        <div className="col-md-6 d-flex flex-row-reverse">
                            {
                                stocks.length > 0 ?
                                    <Search
                                        total={totalItems}
                                        onSearch={value => {
                                            setSearch(value);
                                            setCurrentPage(1);
                                        }}
                                    /> : <></>
                            }
                        </div>
                    </div>

                    <table className="table table-striped">
                        {
                            view == "table" ?
                                <TableHeader
                                    headers={headers}
                                    onSorting={(field, order) =>
                                        setSorting({ field, order })
                                    }
                                /> : <div></div>
                        }
                        <tbody>
                            {
                                view == "table" ?
                                    commentsData.length > 0 ?
                                        commentsData.map(comment => (
                                            <tr>
                                                <th scope="row">
                                                    {comment.date}
                                                </th>
                                                <td>{comment.open !== "null" ? comment.open : "-"}</td>
                                                <td>{comment.high !== "null" ? comment.high : "-"}</td>
                                                <td>{comment.low !== "null" ? comment.low : "-"}</td>
                                                <td>{comment.volume !== "null" ? comment.volume : "-"}</td>
                                                <td>{comment.adjClose !== "null" ? comment.adjClose : "-"}</td>
                                                <td>{comment.close !== "null" ? comment.close : "-"}</td>
                                            </tr>
                                        )) : (<tr>
                                            <td colspan="7">
                                                No data available
                                </td>
                                        </tr>)
                                    : commentsData.length > 0 ?
                                        commentsData.map((comment, idx) => (
                                            <UserCard
                                                key={idx}
                                                sno={idx + 1}
                                                data={comment} />
                                        )) : (<tr>
                                            <td>
                                                No data available
                                </td>
                                        </tr>)
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            { loader}
        </>
    );
};

export default DataTable;
