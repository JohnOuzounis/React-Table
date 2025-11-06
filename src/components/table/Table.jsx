import { useEffect, useState } from 'react';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { FaLongArrowAltDown, FaLongArrowAltUp } from 'react-icons/fa';

import styles from './Table.module.css';

export const Table = ({
    description = [],
    data,
    onNextPage,
    onPrevPage,
    onPageClick,
    totalPages: externalTotalPages,
    totalRecords: externalTotalRecords,
    itemsPerPage = 7,
    classNames = {},
    loading = false,
}) => {
    const [tableData, setTableData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: null,
    });

    const isPaginated = onNextPage || onPrevPage || onPageClick;

    useEffect(() => {
        setTableData(data);
    }, [data]);

    const updateRow = (rowId, updater) => {
        setTableData(prev =>
            prev.map(row => (row.id === rowId ? updater(row) : row))
        );
    };

    const totalRecords = isPaginated
        ? externalTotalRecords ?? tableData.length
        : tableData.length;

    const totalPages = isPaginated
        ? externalTotalPages ?? 1
        : Math.ceil(totalRecords / itemsPerPage);

    const paginatedData = isPaginated
        ? tableData
        : tableData.slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage
          );

    const handlePrevPage = async () => {
        const prevPage = Math.max(currentPage - 1, 1);

        if (prevPage === currentPage) return;
        if (onPrevPage && !(await onPrevPage(prevPage))) return;

        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = async () => {
        const nextPage = Math.min(currentPage + 1, totalPages);

        if (nextPage === currentPage) return;
        if (onNextPage && !(await onNextPage(nextPage))) return;

        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handlePageClick = async page => {
        if (onPageClick && !(await onPageClick(page))) return;
        setCurrentPage(page);
    };

    const renderSortIndicator = key => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? (
            <FaLongArrowAltUp />
        ) : (
            <FaLongArrowAltDown />
        );
    };

    const handleSort = key => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = null;
        }

        setSortConfig({ key: direction ? key : null, direction });

        if (!direction) {
            setTableData(data);
        } else {
            const sorted = [...tableData].sort((a, b) => {
                const conf = description.find(c => c.name === key);

                if (conf.sort) {
                    return conf.sort(a, b, direction);
                }

                const valA = conf.field ? conf.field({ data: a }) : a[key];
                const valB = conf.field ? conf.field({ data: b }) : b[key];

                if (valA == null) return 1;
                if (valB == null) return -1;

                if (typeof valA === 'number' && typeof valB === 'number') {
                    return direction === 'asc' ? valA - valB : valB - valA;
                }

                return direction === 'asc'
                    ? String(valA).localeCompare(String(valB))
                    : String(valB).localeCompare(String(valA));
            });

            setTableData(sorted);
        }
    };

    const renderHeader = () => {
        return (
            <tr>
                {description.map((col, idx) => (
                    <th
                        key={idx}
                        style={{ minWidth: col.width }}
                        onClick={() => col.name && handleSort(col.name)}
                    >
                        {col.Header}
                        {col.name && renderSortIndicator(col.name)}
                    </th>
                ))}
            </tr>
        );
    };

    const renderData = () => {
        if (loading) return;

        const noData = paginatedData.length <= 0;
        if (noData) {
            return (
                <tr>
                    <td
                        colSpan={description.length}
                        style={{ textAlign: 'center' }}
                    >
                        No data available
                    </td>
                </tr>
            );
        }

        return paginatedData.map((row, rowIndex) => (
            <tr key={rowIndex}>
                {description.map((col, colIndex) => (
                    <td key={colIndex}>
                        {col.field
                            ? col.field({
                                  data: row,
                                  update: patch =>
                                      updateRow(row.id, prevRow => ({
                                          ...prevRow,
                                          ...patch,
                                      })),
                              })
                            : row[col.name]}
                    </td>
                ))}
            </tr>
        ));
    };

    const renderPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 3;

        const addPage = page => {
            const isActive = currentPage === page;
            pages.push(
                <button
                    className={`${isActive ? styles.currentPage : ''} ${
                        isActive && classNames.currentPage
                            ? classNames.currentPage
                            : ''
                    }`}
                    key={page}
                    onClick={() => handlePageClick(page)}
                >
                    {page}
                </button>
            );
        };

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) addPage(i);
        } else {
            for (let i = 1; i <= maxPagesToShow; i++) addPage(i);

            if (
                currentPage > maxPagesToShow &&
                currentPage < totalPages - maxPagesToShow + 1
            ) {
                pages.push(<span key='dots1'>...</span>);
                addPage(currentPage);
                pages.push(<span key='dots2'>...</span>);
            } else {
                pages.push(<span key='dots'>...</span>);
            }

            for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++)
                addPage(i);
        }

        return pages;
    };

    const renderPagination = () => {
        const showingCount = isPaginated
            ? tableData.length
            : Math.min(
                  itemsPerPage,
                  totalRecords - (currentPage - 1) * itemsPerPage
              );

        return (
            <div
                className={`${styles.pagination} ${
                    classNames.pagination || ''
                }`}
            >
                <span>
                    Showing {showingCount} out of {totalRecords} results
                </span>
                <div>
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                    >
                        <MdNavigateBefore />
                    </button>

                    {renderPageNumbers()}

                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >
                        <MdNavigateNext />
                    </button>
                </div>
            </div>
        );
    };

    const renderLoader = () => {
        return (
            <div className={styles.loader}>
                <div className={styles['loader-dots']}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        );
    };

    return (
        <div className={`${styles.wrapper} ${classNames.wrapper || ''}`}>
            <div
                className={`${styles.container} ${classNames.container || ''}`}
            >
                <table className='table'>
                    <thead>{renderHeader()}</thead>
                    <tbody>{renderData()}</tbody>
                </table>
            </div>
            {loading && renderLoader()}
            {renderPagination()}
        </div>
    );
};

export default Table;
