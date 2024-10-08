import { Database, OPEN_READWRITE, OPEN_CREATE } from 'sqlite3';

export class SQLite3Service {

    private db: Database;

    constructor(dbPath: string, dealerr: (err: Error | null) => void = () => { }) {
        // 创建数据源, 并设置为读写如文件不存在自动创建不会报错
        this.db = new Database(dbPath, OPEN_READWRITE | OPEN_CREATE, dealerr);
    }

    // 修改 : update, create, delete, insert
    public updateQuery(sql: string, params: any[] = []): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    // 查询 : select
    public selectQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows as T[]);
                }
            });
        });
    }

    // 关闭数据源
    public close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}