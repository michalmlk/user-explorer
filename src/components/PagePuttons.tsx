import styles from "./PageButtons.module.css";

type PageButtonProps = {
    onNext: () => void;
    onPrev: () => void;
    totalPages: number;
    currentPage: number;
    isLoadingNewPage: boolean;
};

export const PageButtons = ({ onNext, onPrev, totalPages, currentPage, isLoadingNewPage }: PageButtonProps) => {
    return (
        <div className={styles.container}>
            <div className={styles.pageButtons}>
                <button className={styles.pageButton} onClick={onPrev} disabled={isLoadingNewPage || currentPage === 1}>
                    PREV
                </button>
                <button
                    className={styles.pageButton}
                    onClick={onNext}
                    disabled={isLoadingNewPage || currentPage === totalPages}
                >
                    NEXT
                </button>
            </div>
            <div className={styles.pagesCounter}>
                <span>
                    {currentPage} / {totalPages}
                </span>
            </div>
        </div>
    );
};
