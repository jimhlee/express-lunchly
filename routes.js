"use strict";

/** Routes for Lunchly */

const express = require("express");

const { BadRequestError } = require("./expressError");
const Customer = require("./models/customer");
const Reservation = require("./models/reservation");

const router = new express.Router();

/** Homepage: show list of customers. */

router.get("/", async function (req, res, next) {
  let searchTerm = req.query.search;
  console.log(searchTerm)
  if (!searchTerm) {
    searchTerm = '';
  }

  let customers = await Customer.all(searchTerm);


  return res.render("customer_list.jinja", { customers });
});


/** Form to add a new customer. */

router.get("/add/", async function (req, res, next) {
  return res.render("customer_new_form.jinja");
});

/**
 * Returns top 10 customers by number of reservations
 */
router.get("/top-ten/", async function (req, res, next) {
  const customers = await Customer.getTopTen();

  return res.render("top-ten.jinja", { customers });
});


/** Handle adding a new customer. */

router.post("/add/", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  const { firstName, lastName, phone, notes } = req.body;
  const customer = new Customer({ firstName, lastName, phone, notes });
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});

/** Show a customer, given their ID. */

router.get("/:id/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);

  const reservations = await customer.getReservations();

  return res.render("customer_detail.jinja", { customer, reservations });
});

/** Show form to edit a customer. */

router.get("/:id/edit/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);

  res.render("customer_edit_form.jinja", { customer });
});

/** Handle editing a customer. */

router.post("/:id/edit/", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  const customer = await Customer.get(req.params.id);
  customer.firstName = req.body.firstName;
  customer.lastName = req.body.lastName;
  customer.phone = req.body.phone;
  customer.notes = req.body.notes;
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});

/** Handle adding a new reservation. */

router.post("/:id/add-reservation/", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError('Invalid request, must fill out all fields');
  }
  const customerId = req.params.id;
  const startAt = new Date(req.body.startAt);
  const numGuests = req.body.numGuests;
  const notes = req.body.notes;

  const reservation = new Reservation({
    customerId,
    startAt,
    numGuests,
    notes,
  });
  await reservation.save();

  return res.redirect(`/${customerId}/`);
});


/** Handle editing a reservation. */

router.post("/reservation/:id/edit/", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }

  const reservation = await Reservation.getReservation(req.params.id);


  reservation.startAt = new Date(req.body.startAt);
  reservation.numGuests = +req.body.numGuests;
  reservation.notes = req.body.notes;

  await reservation.save();

  return res.redirect(`/${reservation.customerId}/`);
});


/** Show form to edit a reservation. */

router.get("/reservation/:id/edit/", async function (req, res, next) {
  const reservation = await Reservation.getReservation(req.params.id);

  res.render("reservation_edit_form.jinja", { reservation });
});

module.exports = router;
