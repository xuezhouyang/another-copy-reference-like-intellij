// Sample TypeScript file for testing

// Interface
interface User {
    id: number;
    name: string;
    email: string;
    isActive?: boolean;
}

// Type alias
type Status = 'pending' | 'approved' | 'rejected';

// Enum
enum Role {
    Admin = 'ADMIN',
    User = 'USER',
    Guest = 'GUEST'
}

// Generic interface
interface Repository<T> {
    findById(id: string): Promise<T | null>;
    save(entity: T): Promise<T>;
    delete(id: string): Promise<boolean>;
}

// Class with generics
class UserRepository implements Repository<User> {
    private users: Map<string, User> = new Map();

    async findById(id: string): Promise<User | null> {
        return this.users.get(id) || null;
    }

    async save(user: User): Promise<User> {
        this.users.set(user.id.toString(), user);
        return user;
    }

    async delete(id: string): Promise<boolean> {
        return this.users.delete(id);
    }

    // Method with optional parameters
    async findByEmail(email: string, includeInactive?: boolean): Promise<User[]> {
        const users = Array.from(this.users.values());
        return users.filter(u =>
            u.email === email && (includeInactive || u.isActive)
        );
    }
}

// Abstract class
abstract class BaseService<T> {
    protected repository: Repository<T>;

    constructor(repository: Repository<T>) {
        this.repository = repository;
    }

    abstract validate(entity: T): boolean;

    async create(entity: T): Promise<T> {
        if (!this.validate(entity)) {
            throw new Error('Validation failed');
        }
        return this.repository.save(entity);
    }
}

// Namespace
namespace Utils {
    export function generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }

    export class Logger {
        static log(message: string): void {
            console.log(`[LOG] ${message}`);
        }
    }
}

// Decorators
function deprecated(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.warn(`${propertyKey} is deprecated`);
}

class APIClient {
    @deprecated
    oldMethod(): void {
        // Old implementation
    }

    newMethod(): void {
        // New implementation
    }
}

// Type guards
function isUser(obj: any): obj is User {
    return 'id' in obj && 'name' in obj && 'email' in obj;
}

// Conditional types
type IsArray<T> = T extends any[] ? true : false;
type Test1 = IsArray<string[]>; // true
type Test2 = IsArray<number>; // false

// Mapped types
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};

// Export statements
export { User, UserRepository, Role, Utils };
export default BaseService;