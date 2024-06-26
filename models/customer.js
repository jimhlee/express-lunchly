"use strict";

/** Customer for Lunchly */

const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this._fullName = this.firstName + ' ' + this.lastName;
    this.phone = phone;
    this.notes = notes;
  }

  /** Find all customers. */

  // static async all() {
  //   const results = await db.query(
  //     `SELECT id,
  //                 first_name AS "firstName",
  //                 last_name  AS "lastName",
  //                 phone,
  //                 notes
  //          FROM customers
  //          ORDER BY last_name, first_name`,
  //   );
  //   return results.rows.map(c => new Customer(c));
  // }

  /** Filters list of customers by search term. */
  static async all(searchTerm) {
    const results = await db.query(
      `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName"
           FROM customers
           WHERE CONCAT(first_name, ' ', last_name) ILIKE $1
           ORDER BY last_name, first_name`,
      [`%${searchTerm}%`]
    );
    return results.rows.map(c => new Customer(c));
  }
  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id,
      first_name AS "firstName",
      last_name  AS "lastName",
      phone,
      notes
      FROM customers
      WHERE id = $1`,
      [id],
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }


  /** Get Top Ten customers*/
  static async getTopTen() {
    const results = await db.query(
      `SELECT c.id,
        c.first_name AS "firstName",
        c.last_name  AS "lastName",
        c.phone,
        c.notes,
        COUNT(r.customer_id) AS "reservation_count"
        FROM customers AS c
        JOIN reservations AS r
        ON c.id = r.customer_id
        GROUP BY c.id
        ORDER BY reservation_count DESC
        LIMIT 10
        `
    );

    const customers = results.rows;

    if (customers === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return customers.map(c => new Customer(c));
  }

  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
            VALUES ($1, $2, $3, $4)
            RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes],
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers
              SET first_name=$1,
              last_name=$2,
              phone=$3,
              notes=$4
              WHERE id = $5`, [
        this.firstName,
        this.lastName,
        this.phone,
        this.notes,
        this.id,
      ],
      );
    }
  }

  /*
  class Cat {
    get color() {
      return this._color;
    }

    set color(val) {
      if (val === "green")
        throw new Error("No green cats!");
      this._color = val;
    }
}
  */
  /** Gets full name of specific customer */
  get fullName() {
    return `${this._fullName}`;
  }

  set fullName(val) {
    this._fullName = val;
  }

}

module.exports = Customer;
