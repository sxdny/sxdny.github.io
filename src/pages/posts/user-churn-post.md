---
layout: ../../layouts/post.astro
title: "user's churn rate with SQL."
description: "Calculating the user's churn rate from a website with SQL."
date: '25-11-2025'
---

It's been a nearly two month ever since I started doing the Data Engineer course from Codecademy.

Yesterday, I was doing some project that requires a little bit of explanation and "showing the data to the customer", I would way. Instead of creating a PowerPoint slide, I thought about publishing it in my blog and explain the thought process behind all the queries and all of that plus simply answering the questions about the task in hand.

So, yeah. I will just start explaining it.

---

# Imaginary company information

We have a company called CodeFlix, a streaming video startup, that is interested in measuring their user churn rate.

We created a database for this company. Inside, we have a table called `subscriptions`. Within the table, there are 4 columns:

- `id`. the subscription's id.
- `subscription_start`. the start date of the subscription.
- `subscription_end`. the cancel date of the subscription. if the value is `null`, it means that the subscription hasn't been canceled (yet).

CodeFlix requires a minimun subscription length of 31 days, meaning that a user can never start and end their subscription in the same month.

Let's have a look inside this table:

```sql
SELECT * FROM subscriptions;
```

Output:

| id  | subscription_start | subscription_end | segment |
| --- | ------------------ | ---------------- | ------- |
| 1   | 2016-12-01         | 2017-02-01       | 87      |
| 2   | 2016-12-01         | 2017-01-24       | 87      |
| 3   | 2016-12-01         | 2017-03-07       | 87      |
| 4   | 2016-12-01         | 2017-02-12       | 87      |
| 5   | 2016-12-01         | 2017-03-09       | 87      |
| 6   | 2016-12-01         | 2017-01-19       | 87      |


<br>

---

<br>
    
## Determining the range of months that the company has been active

Because we have the starting and ending date for each subscription, we can select the month from the starting date with the following statement:

```sql
SELECT DISTINCT strftime('%m', subscription_start) AS month
FROM subscriptions;
```

What this does, first, is to get all the "month" numbers from all the dates with the help of the `strftime()` function. Within this function, I'm passing as a parameter `%m` because I just want the month and the actual date that we are getting the month number, in this case is `subscription_start`.

Later doing this exercise, I noticed that I also needed the year from the dates. To get that, we can use the same `strftime()` function, but instead of passing `%m` we need to pass `%Y`.

Now, with these statements, I can create a temporary table called `operative_months`. I will be using it later:

```sql
WITH operative_months AS (
  SELECT DISTINCT strftime('%m', subscription_start) AS month,
  strftime('%Y', subscription_start) AS year
  FROM subscriptions
)
```

With this table, we will get a table with the following data:

|month | year |
|-----|------|
|12|2016|
|01|2017|
|02|2017|
|03|2017|

Once we have this table created, we can create a `months` table, containing the first and last day for each month listed before. This way, we can compare the dates more easily later.

We can create this table using the following statement:

```sql
months AS (
  SELECT
  date(year || '-' || month || '-01') AS first_day,
  date(year || '-' || month || '-01', '+1 month', '-1 day') AS last_day
  FROM operative_months
)
```

Here I'm creating the `first_day` column concatenaiting the `year`, the `month` and `-01`, because it's the first day of course. Then, for the `last_day` column, i'm just getting the first day of the month, then I add one month and then, I substract one day. I found this solution on the Internet, so thanks guy of the Internet!

<br>

---

<br>
    
## Comparing values

Now that we have the `months` table created, we can use it to compare the values from the `subscriptions` table.

We can perform a CROSS JOIN, because CROSS JOIN is useful for comparing values.

Once again, we create a temporary table called `cross_join` with the following statement:

```sql
cross_join AS (
	SELECT * FROM subscriptions
	CROSS JOIN months
)
```

**Note:** When creating this temporary tables, I'm not using `WITH`. This is because I'm putting it all together, so I can omit the use of `WITH`:

```sql
WITH x AS (
  -- ...
),
y AS (
 -- ...
)
```

The next step is to obtain the status for each subscription for each month. Guess what, we can create another temporary table called `status` that will include the following columns:

- `id`. the subscription's id.
- `month`. the current month of the subscription status.
- `segment`. the segment which it belongs the subscription.
- `is_active`. a boolean value indicating if the subscription is active (`1`) or not (`0`) that month.
- `is_canceled`. boolean value indicating if the subscription is canceled or not.

We can create this temporary table with the following statement:

```sql
status AS (
  SELECT id,
  first_day AS month,
  segment,
  CASE
	  WHEN (subscription_start < first_day)
	    AND (
		    (subscription_end > first_day)
		    OR (subscription_end IS NULL)
	    ) THEN 1
	  ELSE 0
  END AS is_active,
  CASE
	  WHEN subscription_end BETWEEN first_day AND last_day THEN 1
	  ELSE 0
  END AS is_canceled
  FROM cross_join
)
```
