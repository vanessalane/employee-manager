use employee_db;

INSERT INTO department (name)
VALUES 
    ('Sales'),
    ('Engineering'),
    ('Marketing'),
    ('Legal'),
    ('Finance');

INSERT INTO role (title, salary, department_id)
VALUES
    ('Software Engineer', 130000, 2),
    ('Engineering Manager', 220000, 2),
    ('Salesperson', 60000, 1),
    ('Sales Manager', 120000, 1),
    ('Marketing Manager', 130000, 3),
    ('Marketing Associate', 80000, 3),
    ('Attorney', 150000, 4),
    ('Paralegal', 70000, 4),
    ('Financial Analyst', 90000, 5),
    ('Finance Manager', 140000, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ('Elie', 'Wiesel', 1, 2),
    ('Shel', 'Silverstein', 2, NULL),
    ('Smokey', 'Robinson', 3, 4),
    ('Stevie', 'Wonder', 4, NULL),
    ('Adam', 'West', 5, 4),
    ('Clark', 'Kent', 6, 5),
    ('Yoko', 'Ono', 7, 2),
    ('John', 'Lennon', 8, NULL);