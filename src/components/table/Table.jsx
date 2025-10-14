import { useEffect, useState } from 'react';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { FaLongArrowAltDown, FaLongArrowAltUp } from 'react-icons/fa';

import styles from './Table.module.css';

export const Table = ({
    description,
    data,
    onNextPage,
    onPrevPage,
    onPageClick,
    totalPages: externalTotalPages,
    totalRecords: externalTotalRecords,
    itemsPerPage = 7,
    classNames = {},
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
                const valA = a[key];
                const valB = b[key];

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
            // Show first few
            for (let i = 1; i <= maxPagesToShow; i++) addPage(i);

            // Ellipsis in the middle if needed
            if (
                currentPage > maxPagesToShow + 1 &&
                currentPage < totalPages - maxPagesToShow
            ) {
                pages.push(<span key='dots1'>...</span>);
                addPage(currentPage);
                pages.push(<span key='dots2'>...</span>);
            } else {
                pages.push(<span key='dots'>...</span>);
            }

            // Show last few
            for (let i = totalPages - 2; i <= totalPages; i++) addPage(i);
        }

        return pages;
    };

    const showingCount = isPaginated
        ? tableData.length
        : Math.min(
              itemsPerPage,
              totalRecords - (currentPage - 1) * itemsPerPage
          );

    return (
        <div className={`${styles.container} ${classNames.container || ''}`}>
            <table className='table'>
                <thead>
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
                </thead>
                <tbody>
                    {paginatedData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {description.map((col, colIndex) => (
                                <td key={colIndex}>
                                    {col.field
                                        ? col.field({
                                              data: row,
                                              update: patch =>
                                                  updateRow(
                                                      row.id,
                                                      prevRow => ({
                                                          ...prevRow,
                                                          ...patch,
                                                      })
                                                  ),
                                          })
                                        : row[col.name]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
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
        </div>
    );
};

export default Table;
